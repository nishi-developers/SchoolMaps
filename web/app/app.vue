<template>
  <div>
    <VitePwaManifest />
    <NuxtRouteAnnouncer />
    <AppHeader />
    <NuxtPage id="page" />
    <BottomNotify />
  </div>
</template>
<script setup lang="ts">
// デフォルトのピンチアウトを無効化
// 1本をブロックすると、プロパティでのスクロールが無効化されるため、2本以上をブロックする
// <参考> https://moewe-net.com/js/disable-zoom
document.body.addEventListener('touchmove', (event) => {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, { passive: false });
</script>

<style scoped lang="scss">
#page {
  position: relative;
  top: var(--HeaderHeight);
  height: calc(100vh - var(--HeaderHeight));
  overflow-y: auto;
  overflow-x: hidden;
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
