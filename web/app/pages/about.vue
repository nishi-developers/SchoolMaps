<template>
  <div>
    <div class="background text widthLimit">
      <p class="textTitle">このサイトについて</p>
      <p class="textH">西高マップとは</p>
      <p class="textP">
        <b><a href="https://www.metro.ed.jp/nishi-h/" target="_blank"
            rel="noopener noreferrer">東京都立西高等学校</a></b>の校内マップです。<br>
        本サイトに関して、高校へのお問い合わせは行わないでください。
      </p>
      <p class="textH">開発･運営情報</p>
      <p class="textP">
        開発者 : <a href="https://github.com/M-Haruki" target="_blank" rel="noopener noreferrer">M_Haruki</a><br>
        運営団体 : <a href="https://github.com/nishi-developers" target="_blank" rel="noopener noreferrer">504</a><br>
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
      <p class="textH">アクセス解析ツールについて</p>
      <p class="textP">
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
      <span>MapsVersion</span>
      <span>{{ $config.public.mapVersion }}</span>
    </p>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'このサイトについて' })

// クリックカウント
let clickCount = 0;
function handleClick() {
  clickCount++;
  if (clickCount >= 5) {
    navigateTo('/auth');
    clickCount = 0;
  }
}
</script>
<style scoped lang="scss">
#version {
  position: fixed;
  bottom: 0;
  right: 0;
  font-size: 1rem;
  color: var(--AccentBodyColor);
  background-color: var(--SubBaseColor);
  padding: 5px;
  display: grid;
  grid-template-columns: auto auto;
  grid-template-columns: auto auto;
  gap: 5px;
  cursor: pointer;
}

#version-spacer {
  bottom: 0;
  opacity: 0;
  height: 60px;
}

a {
  text-decoration: underline;
}
</style>
