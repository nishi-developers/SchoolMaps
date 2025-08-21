<template>
  <div>
    <div class="page">
      <h1>使い方</h1>
      <h2><nuxt-link to="/">マップ</nuxt-link></h2>
      <ul>
        <li>
          <Icon name="material-symbols:search-rounded" />で検索画面を開きます。
        </li>
        <li>
          <Icon name="material-symbols:reset-focus-outline-rounded" />でマップの位置をリセットします。
        </li>
        <li>
          <Icon name="material-symbols:label-outline-rounded" />で場所名を表示します。
        </li>
        <li>
          <Icon name="material-symbols:label-off-outline-rounded" />で場所名を非表示します。
        </li>
      </ul>
      <h3>PC・マウス</h3>
      <ul>
        <li>ドラッグで移動します。</li>
        <li>ホイールでズームイン・アウトします。</li>
        <li>ホイールを押しながら左右に動かすことで回転します。</li>
      </ul>
      <h3>スマホ・タッチ</h3>
      <ul>
        <li>スワイプで移動します。</li>
        <li>ピンチイン・アウトでズームイン・アウトします。</li>
        <li>2本指で回転させて回転します。</li>
      </ul>
      <h2>詳細</h2>
      <ul>
        <li>場所をタップしたら出てくる詳細画面では、場所の情報や画像を見ることができます。</li>
        <li>バーをスワイプまたはタップすることで、詳細画面を拡大・縮小・開閉が可能です。</li>
      </ul>
      <h2>
        <RouterLink to="search">検索</RouterLink>
      </h2>
      <ul>
        <li>検索ワードを入力することで、場所を検索できます。</li>
        <li>半角/全角スペースで区切ることでOR検索になります。</li>
      </ul>
      <h2>ホーム画面に追加</h2>
      <ul>
        <li>サイトをホーム画面に追加することで、オフラインでもマップを利用できます。</li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
useHead({ title: '使い方' })
</script>