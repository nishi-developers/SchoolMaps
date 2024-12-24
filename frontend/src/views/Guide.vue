<template>
    <div class="background text widthLimit">
        <p class="textTitle">使い方</p>
        <p class="textH">マップ</p>
        <ul class="textP">
            <li><font-awesome-icon :icon="['fas', 'magnifying-glass']" />で検索画面へ</li>
            <li><font-awesome-icon :icon="['fas', 'expand']" />でマップの位置をリセット</li>
            <li><font-awesome-icon :icon="['fas', 'heading']" />で場所名を表示</li>
            <li><font-awesome-icon :icon="['fas', 'text-slash']" />で場所名を非表示</li>
        </ul>
        <p class="textH">マップ (PC・マウス)</p>
        <ul class="textP">
            <li>ドラッグで移動</li>
            <li>ホイールでズームイン・アウト</li>
            <li>ホイールを押しながら左右に動かすことで回転</li>
        </ul>
        <p class="textH">マップ (スマホ・タッチ)</p>
        <ul class="textP">
            <li>スワイプで移動</li>
            <li>ピンチイン・アウトでズームイン・アウト</li>
            <li>2本指で回転させて回転</li>
        </ul>
        <p class="textH">詳細</p>
        <ul class="textP">
            <li>バーをスワイプで閉じる・拡大・縮小</li>
            <li>バーをタップで閉じる </li>
        </ul>
        <p class="textH">検索</p>
        <ul class="textP">
            <li>半角/全角スペースで区切ることでOR検索が可能</li>
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