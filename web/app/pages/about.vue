<template>
  <div>
    <div class="page">
      <h1>サイトについて</h1>
      <h2>西高マップとは</h2>
      <p>
        <a href="https://www.metro.ed.jp/nishi-h/" target="_blank"
          rel="noopener noreferrer">東京都立西高等学校</a>の校内マップアプリです。<br>
        本サイトは下記団体が運営しており、高校へお問い合わせいただいてもお答えできません。
      </p>
      <h2>開発･運営情報</h2>
      <p>
        開発者 : <a href="https://github.com/M-Haruki" target="_blank" rel="noopener noreferrer">M_Haruki</a><br>
        運営団体 : <a href="https://504hp.vercel.app/" target="_blank" rel="noopener noreferrer">504</a><br>
        ソースコードは
        <a href="https://github.com/nishi-developers/SchoolMaps" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        にて
        <a href="https://github.com/nishi-developers/SchoolMaps/blob/main/LICENSE" target="_blank"
          rel="noopener noreferrer">
          MITライセンス
        </a>
        のもと公開しています。
      </p>
      <h3>情報提供団体</h3>
      <ul>
        <li v-for="provider in $detail.infoProviders" :key="provider">
          {{ provider }}
        </li>
      </ul>
      <h2>マップデータの利用ついて(西高生のみ)</h2>
      <p>
        西高生に限り、本サイトのスクリーンショットを含むマップデータを、クレジット不要でご利用いただけます。
        改変等も可能ですので、良識の範囲内でご自由にご活用ください。
        <br>
        西高生以外のサイト観覧を制限するものではありませんが、マップデータのサイト外利用はご遠慮ください。
      </p>
      <h2>アクセス解析ツールについて</h2>
      <p>
        当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス(Google Analytics)」を使用しています。
        このGoogleアナリティクスではトラフィックデータ収集のため、Cookie、広告識別子などの識別情報、データの収集に使われる類似の技術を使用しています。
        これらにより収集されたデータは匿名のものであり、個人を特定するものではありません。
        <br>
        なお、Cookieなどの一部の機能は、ユーザーにより無効にすることが可能です。お使いのブラウザの設定などをご確認ください。
        <br>
        これらのことに関して、詳しくは<a href="https://www.google.com/intl/ja/policies/privacy/partners/" target="_blank"
          rel="noopener noreferrer">「ユーザーが
          Googleパートナーのサイトやアプリを使用する際の Googleによるデータ使用」</a>をご確認ください。
        Googleアナリティクスに関しては、<a href="https://marketingplatform.google.com/about/analytics/terms/jp/" target="_blank"
          rel="noopener noreferrer">「Googleアナリティクス利用規約」</a>もご確認ください。
      </p>
      <div id="version-spacer" />
    </div>
    <p id="version" @click="handleClick">
      <span>SystemVersion</span>
      <span>{{ $config.public.systemVersion }}</span>
      <span>MapVersion</span>
      <span>{{ $detail.mapVersion }}</span>
      <span>DB Integrate</span>
      <span v-if="$detail?.isDatabaseIntegrated">Enabled</span>
      <span v-else>Disabled</span>
    </p>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'このサイトについて' })

const { $detail } = useNuxtApp();

// クリックカウント
let clickCount = 0;
async function handleClick() {
  clickCount++;
  if (clickCount >= 7) {
    await navigateTo('/auth');
    clickCount = 0;
  }
}
</script>
<style scoped lang="scss">
#version-spacer {
  bottom: 0;
  opacity: 0;
  height: 60px;
}

#version {
  position: fixed;
  bottom: 0;
  right: 0;
  font-size: 0.8rem;
  color: var(--AccentBodyColor);
  background-color: var(--SubBaseColor);
  padding: 3px;
  display: grid;
  grid-template-columns: auto auto;
  grid-template-columns: auto auto;
  gap: 3px;
  cursor: default;
  box-shadow: 0 0 3px 2px var(--ShadowColor);
}
</style>
