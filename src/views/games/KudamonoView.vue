<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import type { Game } from "@puyuyu1234/ptre";
import { startGame, getGame } from "@/games/kudamono";

const containerRef = ref<HTMLDivElement>();
let game: Game | null = null;

// モバイルコントロール用（ptreのInputを使用）
const onLeftDown = (): void => getGame().getInput().setKeyPressed("ArrowLeft");
const onLeftUp = (): void => getGame().getInput().setKeyReleased("ArrowLeft");
const onRightDown = (): void => getGame().getInput().setKeyPressed("ArrowRight");
const onRightUp = (): void => getGame().getInput().setKeyReleased("ArrowRight");

onMounted(async () => {
  if (containerRef.value) {
    game = await startGame(containerRef.value);
  }
});

onUnmounted(() => {
  game?.stop();
  game = null;
});
</script>

<template>
  <div class="game-container">
    <h1>くだものキャッチ</h1>
    <div id="canvas-container" ref="containerRef"></div>

    <!-- モバイル用コントロール -->
    <button
      id="left-button"
      @pointerdown="onLeftDown"
      @pointerup="onLeftUp"
      @pointerleave="onLeftUp"
    ></button>
    <button
      id="right-button"
      @pointerdown="onRightDown"
      @pointerup="onRightUp"
      @pointerleave="onRightUp"
    ></button>
  </div>
</template>

<style scoped>
.game-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: none;
}

#canvas-container {
  position: relative;
  overflow: hidden;
}

#canvas-container :deep(canvas) {
  border: 3px solid #000;
  border-radius: 20px;
  margin: 20px auto;
  display: block;
  max-width: 90%;
  width: 100%;
  height: auto !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  image-rendering: pixelated;
}

.instructions {
  color: #666;
  font-size: 0.9rem;
}

/* モバイル用コントロールボタン */
#left-button,
#right-button {
  position: fixed;
  bottom: 30px;
  width: 120px;
  height: 120px;
  border: 4px solid #333;
  border-radius: 50%;
  background: rgba(200, 200, 200, 0.85);
  color: #333;
  font-size: 36px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  z-index: 100;
  transition: all 0.1s ease;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

#left-button {
  left: 30px;
}

#left-button::before {
  content: "◀";
}

#right-button {
  right: 30px;
}

#right-button::before {
  content: "▶";
}

#left-button:active,
#right-button:active {
  background: rgba(150, 150, 150, 0.9);
  transform: scale(0.95);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
}

/* レスポンシブ対応 */
@media (max-width: 480px) {
  #left-button,
  #right-button {
    width: 100px;
    height: 100px;
    font-size: 30px;
    bottom: 20px;
  }

  #left-button {
    left: 20px;
  }

  #right-button {
    right: 20px;
  }
}

@media (max-width: 360px) {
  #left-button,
  #right-button {
    width: 90px;
    height: 90px;
    font-size: 28px;
    bottom: 15px;
  }

  #left-button {
    left: 15px;
  }

  #right-button {
    right: 15px;
  }
}

@media (max-height: 600px) {
  #left-button,
  #right-button {
    bottom: 15px;
    width: 90px;
    height: 90px;
    font-size: 28px;
  }
}
</style>
