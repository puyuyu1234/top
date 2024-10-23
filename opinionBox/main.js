"use strict";

const endPoint =
    "https://script.google.com/macros/s/AKfycbynZqb6uY0t72beiLxz8tJ-ptowVbGC1_WtZABJZ9NIojPkzMTX7MMpRifMLUX8v0Y_ew/exec";

const writeData = async (value) => {
    const data = {
        method: "POST",
        header: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify(value),
    };
    const response = await fetch(endPoint, data);
    const result = await response.json();
    if (result.status == "success") {
        alert("正常に送信されました");
    } else {
        alert("正常に送信できませんでした");
    }
};

const readData = async () => {
    const data = {
        method: "GET",
    };
    const response = await fetch(endPoint, data);
    const result = await response.json();

    result.data.forEach((ntd, id) => {
        const [name, text, dateText] = ntd;
        const date = new Date(dateText);

        // テキスト追加
        {
            const div = document.createElement("div");
            div.className = "opinion";
            const n = `<p class="name">${1 + id} : ${name}</p>`;
            const d = `<p class="date">${date.toLocaleString()}</p>`;
            const t = `<p class="text">${text}</p>`;
            div.innerHTML = `${n}${t}${d}`;
            board.appendChild(div);
        }
    });
};

sendButton.addEventListener("click", () => {
    const n = nameInput.value;
    const t = textInput.value;
    if (t) {
        writeData([n, t]);
    } else {
        alert("本文が空です！");
    }
});

readData();
