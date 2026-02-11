<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <div class="mx-auto max-w-3xl px-2">
      <h1>隠しページ</h1>
      <p>ここは隠しページです</p>

      <h2>制作物</h2>
      <ul class="pl-8">
        <li><RouterLink to="/games/kudamono">kudamono</RouterLink></li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
a {
  color: #66aaff;
}
a:hover {
  text-decoration: underline;
}
</style>
