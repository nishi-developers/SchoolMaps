<script setup>
import { RouterView, useRoute } from 'vue-router'
import Header from './components/Header.vue'
import BottomNotify from './components/BottomNotify.vue';
const route = useRoute()

// デフォルトのピンチアウトを無効化
// 1本をブロックすると、プロパティでのスクロールが無効化されるため、2本以上をブロックする
// <参考> https://moewe-net.com/js/disable-zoom
document.body.addEventListener('touchmove', (event) => {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, { passive: false });
</script>

<template>
  <Header />
  <Transition name="router" mode="out-in">
    <div :key="route.name" id="view">
      <!-- https://zenn.dev/marehalo/articles/vue-router-transition -->
      <RouterView />
    </div>
  </Transition>
  <BottomNotify />
</template>

<style scoped>
#view {
  width: 100%;
  height: 100%;
}

/* transition */
.router-enter-active,
.router-leave-active {
  transition: opacity .15s ease
}

.router-enter-from,
.router-leave-to {
  opacity: 0;
}
</style>
