<script setup lang="ts">
import { RouterLink } from "vue-router";

const buildDate = __BUILD_DATE__;
</script>

<template>
  <div class="home">
    <h1>こふらルーム</h1>
    <p>ここはこふらルーム……</p>
    <p>
      ぎこふらい（puyuyu1234）のホームページです。<br />
      農園関係のゲームとかを制作しています。
    </p>

    <h2>制作物</h2>
    <ul class="pl-8">
      <li><a href="../tulipclicker/index.html">tulipclicker</a></li>
      <li><a href="../soukoban/index.html">🥺を寝床に押し込むゲーム</a></li>
      <li><a href="../terminal/index.html">廃駅ホームの待ち人</a></li>
    </ul>

    <h2>ツール</h2>
    <ul class="pl-8">
      <li><a href="../botanobuilder/index.html">botanobuilder</a></li>
      <li><a href="../botanobuilder/easy.html">botanobuilder（簡易版）</a></li>
      <li><RouterLink to="/aa2picture">AA画像化</RouterLink></li>
      <li><a href="../sorede/index.html">それで？bot</a></li>
    </ul>

    <h2>その他</h2>
    <ul class="pl-8">
      <li><RouterLink to="/nouen-chara">農園 キャラ まとめ</RouterLink></li>
      <li><a href="../imomushi/index.html">ゲームエンジン開発</a></li>
    </ul>

    <h2>未完</h2>
    <ul class="pl-8">
      <li><a href="../ankagame/index.html">安価でゲーム作る</a></li>
      <li><a href="../wwaction/index.html">ウォールウィンディアクション</a></li>
    </ul>

    <h2>メモ</h2>
    <ul class="pl-8">
      <li><RouterLink to="/page2" class="text-transparent!">隠しページ</RouterLink></li>
    </ul>
    <span class="text-sm text-gray-500">（最終更新: {{ buildDate }}）</span>
  </div>
</template>

<style scoped>
.home {
  max-width: 800px;
  padding: 0 0.5em;
  margin: auto;
}
</style>
