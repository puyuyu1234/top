"use strict";

const makeCanvas = () => {
    const text = originalTextarea.value;
    const charColor = charColorInput.value;
    const bgColor = bgColorInput.value;
    const isBgColorTransparent = bgColorTransparentInput.checked;
    const marginH = +marginHInput.value;
    const marginW = +marginWInput.value;
    const isPic8x = pic8xInput.checked;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    // サイズ測定
    {
        const lines = text.split("\n");
        canvas.height = lines.length * 18 - 3 + marginH * 2;
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
        canvas.width = xMax - 1 + marginW * 2;
    }

    context.font = "16px Saitamaar";
    context.textBaseline = "top";
    context.imageSmoothingEnabled = true;
    if (!isBgColorTransparent) {
        context.fillStyle = bgColor;
        context.fillRect(0, 0, 1000, 1000);
    }
    context.fillStyle = charColor;
    let y = marginH + 1;
    text.split("\n").forEach((line) => {
        let x = marginW;
        line.split("").forEach((char) => {
            const tm = context.measureText(char);
            context.fillText(char, x, y, tm.width);
            x += Math.round(tm.width);
        });
        y += 18;
    });

    return [canvas, isPic8x ? 8 : 1];
};

let canvas;

convertButton.addEventListener("click", () => {
    const [c, scale] = makeCanvas();
    canvas = document.createElement("canvas");
    const w = (canvas.width = scale * c.width);
    const h = (canvas.height = scale * c.height);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(c, 0, 0, w, h);
    const p = document.createElement("p");
    p.innerText = `画像サイズ：${canvas.width} × ${canvas.height}`;

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
