"use strict";

const URL =
    "https://script.google.com/macros/s/AKfycbyGeF2DocntYyKk0RW6awY-T8skNEuYlYags9o8yCrnvVBDWR6MxFT0aO3QmUtq129g/exec";
// データを書き込むための関数
async function writeData(value) {
    const response = await fetch(URL, {
        method: "POST",
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
            action: "write",
            value: value,
        }),
    });

    const result = await response.json();
    console.log(result);
}

// データを取得するための関数
async function readData() {
    const response = await fetch(URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            action: "read",
        }),
    });

    const result = await response.json();
    console.log(result);
}

sendButton.addEventListener("click", () => {
    const t = textInput.value;
    if (t != "") {
        writeData([nameInput.value, t]);
    }
});
