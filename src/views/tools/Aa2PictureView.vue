<script setup lang="ts">
import { ref, onMounted } from "vue";

const originalText = ref("");
const charColor = ref("#000000");
const bgColor = ref("#f0f0f0");
const isBgTransparent = ref(false);
const marginH = ref(0);
const marginW = ref(0);
const isPic8x = ref(false);
const canvasWrapperRef = ref<HTMLDivElement>();
const saveButtonRef = ref<HTMLButtonElement>();
let canvas: HTMLCanvasElement | null = null;

onMounted(() => {
  // Saitamaarフォントを読み込み
  const baseUrl = import.meta.env.BASE_URL;
  const font = new FontFace("Saitamaar", `url(${baseUrl}fonts/Saitamaar.woff2)`);
  font
    .load()
    .then((loadedFont) => {
      document.fonts.add(loadedFont);
    })
    .catch(() => {
      console.warn("Saitamaar font not found.");
    });
});

const makeCanvas = (): { canvas: HTMLCanvasElement; scale: number } | null => {
  const text = originalText.value;
  if (!text) return null;

  const c = document.createElement("canvas");
  const context = c.getContext("2d");
  if (!context) return null;

  // サイズ測定
  const lines = text.split("\n");
  c.height = lines.length * 18 - 2 + marginH.value * 2;
  context.font = "16px Saitamaar";

  let xMax = 0;
  lines.forEach((line) => {
    let x = 0;
    line.split("").forEach((char) => {
      const tm = context.measureText(char);
      x += Math.round(tm.width);
    });
    xMax = Math.max(xMax, x);
  });
  c.width = xMax + marginW.value * 2;

  context.font = "16px Saitamaar";
  context.textBaseline = "top";
  context.imageSmoothingEnabled = true;

  if (!isBgTransparent.value) {
    context.fillStyle = bgColor.value;
    context.fillRect(0, 0, 1000, 1000);
  }

  context.fillStyle = charColor.value;
  let y = marginH.value + 1;
  lines.forEach((line) => {
    let x = marginW.value;
    line.split("").forEach((char) => {
      const tm = context.measureText(char);
      context.fillText(char, x, y, tm.width);
      x += Math.round(tm.width);
    });
    y += 18;
  });

  return { canvas: c, scale: isPic8x.value ? 8 : 1 };
};

const convert = (): void => {
  const result = makeCanvas();
  if (!result || !canvasWrapperRef.value) return;

  const { canvas: c, scale } = result;
  canvas = document.createElement("canvas");
  const w = (canvas.width = scale * c.width);
  const h = (canvas.height = scale * c.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c, 0, 0, w, h);

  const p = document.createElement("p");
  p.innerText = `画像サイズ：${canvas.width} × ${canvas.height}`;

  canvasWrapperRef.value.innerHTML = "";
  canvasWrapperRef.value.appendChild(p);
  canvasWrapperRef.value.appendChild(canvas);

  if (saveButtonRef.value) {
    saveButtonRef.value.style.display = "block";
  }
};

const save = (): void => {
  if (!canvas) return;
  const a = document.createElement("a");
  a.href = canvas.toDataURL();
  a.download = "image.png";
  a.click();
};
</script>

<template>
  <div class="aa2picture">
    <h1>AA画像化</h1>
    <textarea v-model="originalText"></textarea><br />
    <div class="button-setting-wrapper">
      <button @click="convert">変換</button>
      <div class="setting-wrapper">
        <label>文字色：<input v-model="charColor" type="color" /></label><br />
        <label>背景色：<input v-model="bgColor" type="color" /></label>
        <label>背景透過：<input v-model="isBgTransparent" type="checkbox" /></label><br />
        <label>余白上下：<input v-model="marginH" type="number" /> px</label><br />
        <label>余白左右：<input v-model="marginW" type="number" /> px</label><br />
        <label>画像サイズ8倍（JPEG用）：<input v-model="isPic8x" type="checkbox" /></label><br />
      </div>
    </div>
    <div ref="canvasWrapperRef" class="canvas-wrapper"></div>
    <button ref="saveButtonRef" class="save-button" @click="save">保存</button>
    <hr />
    <p>Saitamaarフォントを使用させていただいております。</p>
  </div>
</template>

<style scoped>
/* フォントはJSで動的に読み込み */

.aa2picture {
  font-family: "Saitamaar", monospace;
  font-size: 16px;
  line-height: 18px;
}

.aa2picture * {
  font-family: "Saitamaar", monospace;
  font-size: 16px;
  line-height: 18px;
}

textarea {
  width: min(80vw, 30em);
  height: 10em;
  text-wrap: nowrap;
  font-family: "Saitamaar", monospace;
}

button {
  margin: 10px;
  width: 5em;
  height: 5em;
}

hr {
  border: none;
  border-top: 1px solid black;
}

.canvas-wrapper :deep(canvas) {
  width: calc(100% - 2px);
  aspect-ratio: 1 / 1;
  image-rendering: pixelated;
  object-fit: contain;
  background-color: #f0f0f0;
  border: 1px solid black;
}

.save-button {
  display: none;
}

input[type="number"] {
  width: 3em;
}

.button-setting-wrapper {
  display: flex;
  margin: 10px;
}

label {
  display: inline-block;
}
</style>
