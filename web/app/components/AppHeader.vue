<template>
  <div id="header">
    <div id="title">
      <nuxt-link v-if="route.name !== 'index'" to="/">
        <span class="mainTitle">西高マップ</span>
      </nuxt-link>
      <a v-else href="/" @click.prevent>
        <span class="mainTitle">西高マップ</span>
      </a>
    </div>
    <div id="menu">
      <nuxt-link to="/guide">使い方</nuxt-link>
      <nuxt-link to="/about">サイトについて</nuxt-link>
    </div>
  </div>
</template>
<script setup lang="ts">
const route = useRoute();
</script>
<style scoped lang="scss">
#header {
  background-color: var(--MainColor);
  width: 100%;
  height: v-bind("$config.public.headerHeightPx + 'px'");
  position: fixed;
  top: 0;
  left: 0;
  font-weight: bold;
  box-shadow: 0 0 3px 2px var(--ShadowColor);
  z-index: 100; // 影を出すために高く設定

  #title {
    margin-left: 15px;
    position: absolute;
    top: 50%;
    left: 0%;
    transform: translate(0%, -50%);

    a {
      text-decoration: none;

      .mainTitle {
        font-size: 1.5rem;
        color: var(--MainBodyColor);
      }
    }
  }

  #menu {
    margin-right: 15px;
    position: absolute;
    top: 50%;
    right: 0%;
    transform: translate(0%, -50%);

    a {
      margin-left: 15px;
      font-size: 1rem;
      color: var(--MainBodyColor);
      text-decoration: none;
    }
  }
}
</style>