<script setup lang="ts">
const characters = [
  {
    name: "山田舞花",
    date: "2023/10/17",
    url: "https://tulipplantation.com/#tulipplantation/1697454765",
    text: "承認欲求に飢えてるから安価で女の子作る😡",
  },
  {
    name: "でかなさけ",
    date: "2023/10/17",
    url: "https://tulipplantation.com/#tulipplantation/1697554114",
    text: "👤👈😲あっ！突如として農園に現れたマスコットキャラクターのでかなさけだ！！！",
  },
  {
    name: "（名称不明）",
    date: "2023/10/20",
    url: "https://tulipplantation.com/#tulipplantation/1697780498",
    text: "でか😐ぬぇーふ持ってる農民いない？🥺",
  },
  {
    name: "でかなさけトレイン",
    date: "2023/10/22",
    url: "https://tulipplantation.com/#tulipplantation/1697943454",
    text: "でかなさけ𝑻𝒓𝒂𝒊𝒏きたよ🟨🟨🟨🟨🟨≡≡💨",
  },
  {
    name: "虹なさけ",
    date: "2023/12/2",
    url: "https://tulipplantation.com/#tulipplantation/1701517729",
    text: "😲👉あ！見れたら一日ラッキー虹なさけだ！！",
  },
  {
    name: "超大型ぷゆゆ",
    date: "2023/12/3",
    url: "https://tulipplantation.com/#tulipplantation/1701591422",
    text: "農園に超大型ぷゆゆ到来",
  },
  {
    name: "ティガレックスなさけ",
    date: "2023/12/6",
    url: "https://tulipplantation.com/#tulipplantation/1701860073",
    text: "┌(┌🥺)┐プユゥ...",
  },
  {
    name: "板イーター",
    date: "2023/12/11",
    url: "https://tulipplantation.com/#tulipplantation/1702269942",
    text: "この板イーターきたよぉ🥺",
  },
  {
    name: "奇行種なさけ",
    date: "2023/12/14",
    url: "https://tulipplantation.com/#tulipplantation/1702488684",
    text: "👤新しく生まれ変わった農園をお祝いしに来たよ",
  },
  {
    name: "学びガール",
    date: "2023/12/16",
    url: "https://tulipplantation.com/#tulipplantation/1702690042",
    text: "✌👧学びガールの一口豆知識のコーナー✨ [今日の一口豆知識★]",
  },
  {
    name: "爆撃なさけ（蝙蝠ぷゆゆ）",
    date: "2023/12/25",
    url: "https://tulipplantation.com/#tulipplantation/1703473544",
    text: "四聖獣ってなんなの…？🥺",
  },
  {
    name: "ぽぽ",
    date: "2024/1/5",
    url: "https://tulipplantation.com/#tulipplantation/1704384742",
    text: "ぽぽには優しくしてほしいぽぽ！😭",
  },
  {
    name: "胴長ひろし",
    date: "2024/1/22",
    url: "https://tulipplantation.com/#tulipplantation/1705919345",
    text: "😸安価でこの猫の名前とか色々決めるスレ😸",
  },
  {
    name: "ビキニなさけ",
    date: "2024/2/5",
    url: "https://tulipplantation.com/#tulipplantation/1707134678",
    text: "ビキニなさけきたよぉ🥺",
  },
  {
    name: "汝英子",
    date: "2024/4/3",
    url: "https://tulipplantation.com/#tulipplantation/1712133918",
    text: "彡(＜👁️＞/🫦＜👁️＞)ミ「どうも、農園の新マスコットキャラクターの汝英子(なん　じぇいこ)です。」【変】",
  },
  {
    name: "シードラ",
    date: "2024/4/7",
    url: "https://tulipplantation.com/#tulipplantation/1712492702",
    text: "プロのイラストヘーター(下手)だけど安価で絵描く",
  },
  {
    name: "ノリオ",
    date: "2024/4/21",
    url: "https://tulipplantation.com/#tulipplantation/1713683463",
    text: "クッッッッッッソかわいい農園マスコットキャラ描いた😳",
  },
  {
    name: "あルミ二ウむ🦾くん",
    date: "2024/8/7",
    url: "https://tulipplantation.com/#tulipplantation/1723019145",
    text: "農園のマスコットは",
    note: "（名前初出）",
  },
  {
    name: "あルミ二ウむ🦾くん",
    date: "2024/8/7",
    url: "https://tulipplantation.com/#tulipplantation/1723025717",
    text: "あルミ二ウむ🦾くんです",
    note: "（画像初出？）",
    skipName: true,
  },
  {
    name: "ウォールウィンディ",
    date: "2024/9/1",
    url: "https://tulipplantation.com/#tulipplantation/1725171305",
    text: "🧵新キャラ登場！！！！🧵",
  },
];
</script>

<template>
  <div class="mx-auto max-w-3xl px-2">
    <h1>農園 キャラ まとめ</h1>
    <p>農園キャラの情報リンクまとめです。</p>
    <p>間違ってたら直します、まずかったら消します。</p>
    <p>2026/2/11追記：リンクが死んでいるので要望があればカメムシのリンクに変えたい</p>

    <h2>キャラリンク</h2>
    <table class="m-8 border-collapse">
      <thead>
        <tr>
          <th class="border border-gray-300 bg-gray-100 px-3 py-2">名前</th>
          <th class="border border-gray-300 bg-gray-100 px-3 py-2">初出</th>
          <th class="border border-gray-300 bg-gray-100 px-3 py-2">URL</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(chara, index) in characters" :key="index">
          <tr>
            <td
              v-if="!chara.skipName"
              :rowspan="characters[index + 1]?.skipName ? 2 : 1"
              class="border border-gray-300 px-3 py-2"
            >
              {{ chara.name }}
            </td>
            <td class="border border-gray-300 px-3 py-2">{{ chara.date }}</td>
            <td class="border border-gray-300 px-3 py-2">
              <a :href="chara.url" target="_blank">{{ chara.text }}</a>
              <span v-if="chara.note">{{ chara.note }}</span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
