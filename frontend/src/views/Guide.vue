<template>
    <div class="background text widthLimit">
        <p class="textTitle">使い方</p>
        <p class="textH">マップ</p>
        <ul class="textP">
            <li><font-awesome-icon :icon="['fas', 'magnifying-glass']" />で検索画面を開きます。</li>
            <li><font-awesome-icon :icon="['fas', 'expand']" />でマップの位置をリセットします。</li>
            <li><font-awesome-icon :icon="['fas', 'heading']" />で場所名を表示します。</li>
            <li><font-awesome-icon :icon="['fas', 'text-slash']" />で場所名を非表示します。</li>
        </ul>
        <p class="textH2">PC・マウス</p>
        <ul class="textP">
            <li>ドラッグで移動します。</li>
            <li>ホイールでズームイン・アウトします。</li>
            <li>ホイールを押しながら左右に動かすことで回転します。</li>
        </ul>
        <p class="textH2">スマホ・タッチ</p>
        <ul class="textP">
            <li>スワイプで移動します。</li>
            <li>ピンチイン・アウトでズームイン・アウトします。</li>
            <li>2本指で回転させて回転します。</li>
        </ul>
        <p class="textH">詳細</p>
        <ul class="textP">
            <li>場所をタップしたら出てくる詳細画面では、場所の情報や画像を見ることができます。</li>
            <li>バーをスワイプまたはタップすることで、詳細画面を拡大・縮小・開閉が可能です。</li>
        </ul>
        <p class="textH">検索</p>
        <ul class="textP">
            <li>検索ワードを入力することで、場所を検索できます。</li>
            <li>半角/全角スペースで区切ることでOR検索になります。</li>
        </ul>
        <p class="textH">ホーム画面に追加</p>
        <ul class="textP">
            <li>サイトをホーム画面に追加することで、オフラインでもマップを利用できます。</li>
        </ul>
    </div>
</template>
<style scoped>
ul {
    list-style: disc;
    padding-left: 25px;
}

li {
    display: list-item;
    overflow: visible;
}
</style>