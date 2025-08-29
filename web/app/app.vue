<template>
  <VitePwaManifest />
  <NuxtRouteAnnouncer />
  <AppHeader />
  <!-- NuxtPageは各Vueファイルの一番外側のdivタグに置き換えられる -->
  <NuxtPage id="nuxt-page" :style="{
    top: `${$config.public.headerHeightPx}px`,
    height: `calc(100vh - ${$config.public.headerHeightPx}px)`
  }" />
  <!-- css内でv-bindを使えなかったため、上のように実装 -->
  <BottomNotify />
</template>
<script setup lang="ts">
// デフォルトのピンチアウトを無効化
// 1本をブロックすると、プロパティでのスクロールが無効化されるため、2本以上をブロックする
// <参考> https://moewe-net.com/js/disable-zoom
// document.body.addEventListener('touchmove', (event) => {
//   if (event.touches.length > 1) {
//     event.preventDefault();
//   }
// }, { passive: false });
</script>

<style scoped lang="scss">
#nuxt-page {
  position: relative;
  overflow: hidden;
}

/* transition */
.page-enter-active,
.page-leave-active {
  transition: opacity .15s ease
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
