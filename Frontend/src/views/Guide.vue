<template>
    <div class="background text">
        <p class="textTitle">使い方</p>
        <p class="textH">Map (PC・マウス)</p>
        <ul class="textP">
            <li>ドラッグで移動</li>
            <li>ホイールでズームイン・アウト</li>
            <li>ホイールを押して左右に動かすことで回転</li>
            <li>ダブルクリックでリセット</li>
        </ul>
        <p class="textH">Map (スマホ・タッチ)</p>
        <ul class="textP">
            <li>スワイプで移動</li>
            <li>ピンチイン・アウトでズームイン・アウト</li>
            <li>2本指で回転させて回転</li>
            <li>ダブルタップでリセット</li>
        </ul>
        <p class="textH">詳細画面</p>
        <ul class="textP">
            <li>バーをスワイプで閉じる・拡大・縮小</li>
            <li>バーをタップで閉じる </li>
            <li>バーをダブルタップで最大化・最小化</li>
        </ul>
        <p class="textH">検索画面</p>
        <p>スペースで区切ることでOR検索が可能</p>
        <table id="search">
            <thead>
                <tr>
                    <th>検索方法</th>
                    <th>意味 ※{}は不要</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{文字列}</td>
                    <td>{文字列}を全場所から検索</td>
                </tr>
                <tr>
                    <td>name:{文字列}</td>
                    <td>名前に{文字列}を含む場所を検索</td>
                </tr>
                <tr>
                    <td>floor:{文字列}</td>
                    <td>階に{文字列}を含む場所を検索</td>
                </tr>
                <tr>
                    <td>place:{文字列}</td>
                    <td>場所に{文字列}を含む場所を検索</td>
                </tr>
                <tr>
                    <td>desc:{文字列}</td>
                    <td>説明に{文字列}を含む場所を検索</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<style scoped>
ul {
    padding-left: 20px;
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