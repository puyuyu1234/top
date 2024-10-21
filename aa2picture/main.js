"use strict";

let canvas;
convertButton.addEventListener("click", () => {
    const text = originalTextarea.value;
    const charColor = charColorInput.value;
    const bgColor = bgColorInput.value;
    const isBgColorTransparent = bgColorTransparentInput.checked;
    const margin = +marginInput.value;

    canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    // サイズ測定
    {
        const lines = text.split("\n");
        canvas.height = lines.length * 18 - 3 + margin * 2;
        context.font = "16px Saitamaar";
        let xMax = 0;
        text.split("\n").forEach((line) => {
            let x = 0;
            line.split("").forEach((char) => {
                const tm = context.measureText(char);
                x += Math.round(tm.width);
            });
            xMax = Math.max(xMax, x);
        });
        canvas.width = xMax - 1 + margin * 2;
    }
    const p = document.createElement("p");
    p.innerText = `画像サイズ：${canvas.width} × ${canvas.height}`;

    context.font = "16px Saitamaar";
    context.textBaseline = "top";
    context.imageSmoothingEnabled = true;
    if (!isBgColorTransparent) {
        context.fillStyle = bgColor;
        context.fillRect(0, 0, 1000, 1000);
    }
    context.fillStyle = charColor;
    let y = margin + 1;
    text.split("\n").forEach((line) => {
        let x = margin;
        line.split("").forEach((char) => {
            const tm = context.measureText(char);
            context.fillText(char, x, y, tm.width);
            x += Math.round(tm.width);
        });
        y += 18;
    });

    canvasWrapper.innerHTML = "";
    canvasWrapper.appendChild(p);
    canvasWrapper.appendChild(canvas);
    saveButton.style.display = "block";
});

saveButton.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL();
    a.download = "image.png";
    a.click();
});
