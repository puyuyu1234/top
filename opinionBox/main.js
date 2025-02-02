"use strict";

const endPoint =
    "https://script.google.com/macros/s/AKfycbynZqb6uY0t72beiLxz8tJ-ptowVbGC1_WtZABJZ9NIojPkzMTX7MMpRifMLUX8v0Y_ew/exec";

const sendButton = document.getElementById("sendButton");

sendButton.addEventListener("click", () => {
    const n = nameInput.value;
    const t = textInput.value;
    if (t) {
        sendButton.disabled = true;
        sendButton.innerText = "送信中……";
        writeData([n, t]);
    } else {
        alert("本文が空です！");
    }
});

const writeData = async (value) => {
    const data = {
        method: "POST",
        header: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify(value),
    };
    fetch(endPoint, data)
        .then((response) => {
            if (response.ok) {
                alert("送信しました。");
            } else {
                alert(`エラーコード：${response.status}`);
            }
        })
        .catch((error) => {
            alert(error);
        })
        .finally(() => {
            sendButton.disabled = false;
            sendButton.innerText = "送信";
        });
};

const board = document.getElementById("board");
const readData = async () => {
    const data = {
        method: "GET",
    };
    const result = await fetch(endPoint, data).then((response) => response.json());

    const opinionDivList = result.data
        .map(([name, text, dateText], index) => {
            const date = new Date(dateText);
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
        })
        .toReversed();

    // スケルトン削除
    {
        board.replaceChildren(...opinionDivList);
    }
};

readData();
