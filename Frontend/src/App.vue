<script setup>
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
</script>

<template>
  <Header />
  <RouterView />
</template>

<style scoped>
.background {
  box-sizing: border-box;
  background-color: var(--MainBaseColor);
  width: 100%;
  height: calc(100% - var(--header-height));
  padding: 15px;
}
</style>
