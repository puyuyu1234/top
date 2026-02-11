<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const containerRef = ref<HTMLDivElement>()
const scripts: HTMLScriptElement[] = []
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '') // 末尾スラッシュ除去

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = BASE + src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.body.appendChild(script)
    scripts.push(script)
  })
}

onMounted(async () => {
  // グローバル変数でBASE_URLを渡す
  ;(window as unknown as Record<string, string>).__BASE_URL__ = BASE

  try {
    await loadScript('/legacy/engine/engine2.js')
    await loadScript('/legacy/kudamono/main.js')
  } catch (e) {
    console.error('Failed to load game scripts:', e)
  }
})

onUnmounted(() => {
  scripts.forEach(script => script.remove())
})
</script>

<template>
  <div class="game-container">
    <h1>くだものキャッチ</h1>
    <div id="canvas-container" ref="containerRef"></div>
    <div class="controls">
      <button id="left-button">←</button>
      <button id="right-button">→</button>
    </div>
    <p class="instructions">左右キーまたはボタンで移動、りんごをキャッチ！爆弾に注意</p>
  </div>
</template>

<style scoped>
.game-container {
  text-align: center;
}

#canvas-container {
  margin: 1rem auto;
  display: inline-block;
}

#canvas-container :deep(canvas) {
  border: 1px solid #333;
  cursor: pointer;
}

.controls {
  margin: 1rem 0;
}

.controls button {
  font-size: 1.5rem;
  padding: 0.5rem 1.5rem;
  margin: 0 0.5rem;
  cursor: pointer;
}

.instructions {
  color: #666;
  font-size: 0.9rem;
}
</style>
