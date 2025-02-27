"use strict";

const endPoint =
  "https://api.github.com/repos/puyuyu1234/top/actions/workflows/update-messages.yml/dispatches";

const sendButton = document.getElementById("sendButton");

sendButton.addEventListener("click", () => {
  const name = nameInput.value;
  const message = textInput.value;
  if (!message) {
    alert("本文が空です！");
    return;
  }
  sendButton.disabled = true;
  sendButton.innerText = "送信中……";
  fetch(endPoint, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: "Bearer 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",
    },
    body: JSON.stringify({
      ref: "main",
      inputs: { name, message },
    }),
  })
    .then((response) => {
      if (response.ok) {
        alert("送信しました。");
      } else {
        alert(`送信エラー\nエラーコード：${response.status}`);
      }
    })
    .catch((error) => {
      alert(`送信エラー\n${error}`);
    })
    .finally(() => {
      sendButton.disabled = false;
      sendButton.innerText = "送信";
    });
});

const board = document.getElementById("board");
const readData = () => {
  const url = "messages.json";
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      return json.map((obj, index) => {
        const name = obj.name;
        const text = obj.text;
        const date = new Date(obj.timestamp);

        const div = document.createElement("div");
        div.className = "opinion";
        const n = document.createElement("p");
        n.className = "name";
        n.innerText = `${1 + index} : ${name}`;
        const d = document.createElement("p");
        d.className = "date";
        d.innerText = date.toLocaleString();
        const t = document.createElement("p");
        t.className = "text";
        t.innerText = text;
        div.append(n, t, d);

        return div;
      });
    })
    .then((divs) => {
      board.replaceChildren(...divs);
    });
};
readData();
