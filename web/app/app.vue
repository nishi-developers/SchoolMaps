<template>
  <div>
    <VitePwaManifest />
    <NuxtRouteAnnouncer />
    <AppHeader />
    <NuxtPage />
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
#view {
  width: 100%;
  height: 100%;
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
