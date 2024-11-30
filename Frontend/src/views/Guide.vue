<template>
    <div class="background text widthLimit">
        <p class="textTitle">使い方</p>
        <p class="textH">Map (PC・マウス)</p>
        <ul class="textP">
            <li>- ドラッグで移動</li>
            <li>- ホイールでズームイン・アウト</li>
            <li>- ホイールを押して左右に動かすことで回転</li>
        </ul>
        <p class="textH">Map (スマホ・タッチ)</p>
        <ul class="textP">
            <li>- スワイプで移動</li>
            <li>- ピンチイン・アウトでズームイン・アウト</li>
            <li>- 2本指で回転させて回転</li>
        </ul>
        <p class="textH">詳細画面</p>
        <ul class="textP">
            <li>- バーをスワイプで閉じる・拡大・縮小</li>
            <li>- バーをタップで閉じる </li>
        </ul>
        <p class="textH">検索画面</p>
        <ul class="textP">
            <li>- 半角/全角スペースで区切ることでOR検索が可能</li>
        </ul>
    </div>
</template>
<style scoped>
ul {
    padding-left: 10px;
}

#search {
    color: var(--MainBodyColor);
    border-collapse: collapse;
    text-align: left;
}

#search th,
#search td {
    border: solid 1px var(--MainBodyColor);
    padding: 3px 5px;
}
</style>