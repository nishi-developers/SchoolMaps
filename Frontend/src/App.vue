<script setup>
import { RouterView, useRoute } from 'vue-router'
import Header from './components/Header.vue'
const route = useRoute()
</script>

<template>
  <Header />
  <Transition name="router" mode="out-in">
    <div :key="route.fullPath" id="view">
      <!-- https://zenn.dev/marehalo/articles/vue-router-transition -->
      <RouterView />
    </div>
  </Transition>
</template>

<style scoped>
#view {
  width: 100%;
  height: 100%;
}

/* transition */
.router-enter-active,
.router-leave-active {
  transition: opacity .25s ease, transform .25s ease;
}

.router-enter-from,
.router-leave-to {
  opacity: 0;
  transform: translateX(-2%);
}
</style>
