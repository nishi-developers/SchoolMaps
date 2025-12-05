<template>
  <div>
    <h1>管理</h1>
    <nuxt-link to="/admin/distribute">データ配置</nuxt-link>
    <nuxt-link to="/admin/deauth">認証解除</nuxt-link>
  </div>
</template>
<script setup lang="ts">
useHead({ title: '管理コンソール' })
</script>