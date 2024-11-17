<template>
    <div class="background text">
        <p class="textTitle">このサイトについて</p>
        <p class="textH">西高MAPとは?</p>
        <p class="textP">
            <b><a href="https://www.metro.ed.jp/nishi-h/">東京都立西高等学校</a></b>のマップです。<br>
            <!-- プログラミングサークル<b>504</b>によって作成、運営されています。<br> -->
            本サイトに関して、都立西高校へのお問い合わせは行わないでください。
        </p>
        <p class="textH">マップデータについて</p>
        <p class="textP">
            マップデータの著作権は制作者に帰属します。<br>
            マップデータのダウンロード・無断転載・再配布は禁止します。
        </p>
        <p class="textH">クレジット</p>
        <p class="textP">
            マップ作成:<a href="https://www.google.com/maps">GoogleMap</a>,
            <a href="https://www.openstreetmap.org/">OpenStreetMap</a>,
            <a href="https://inkscape.org">Inkscape</a><br>
            ファビコン:<a href="https://icon-rainbow.com/現在地を示すマップのピンのアイコン素材-4/">Icon-rainbow</a>
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
        <br id="version-spacer">
    </div>
    <p id="version">
        SystemVersion: {{ sysVersion }}<br>
        MapVersion: {{ mapVersion }}
    </p>
</template>
<style scoped>
#version {
    position: fixed;
    bottom: 0;
    right: 0;
    font-size: 1rem;
    color: var(--AccentBodyColor);
    background-color: var(--SubBaseColor);
    padding: 5px;
    text-align: right;
}

#version-spacer {
    bottom: 0;
    font-size: 2rem;
    padding: 5px;
    opacity: 0;
}
</style>
<script setup>
const sysVersion = import.meta.env.VITE_SYS_VERSION;
const mapVersion = import.meta.env.VITE_MAP_VERSION;
</script>