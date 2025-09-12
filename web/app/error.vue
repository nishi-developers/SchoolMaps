<template>
  <div class="page">
    <div v-if="error?.statusCode === 404">
      <h1>404 Not Found</h1>
      <h2>お探しのページは見つかりませんでした。</h2>
      <p>
        お探しのページは削除されたか、URLが変更された可能性があります。
      </p>
    </div>
    <div v-else>
      <h1 class="status">{{ error?.statusCode }}</h1>
      <h2>{{ error?.message }}</h2>
      <p class="link" @click="$router.back();">
        Back to Previous Page
      </p>
      <p class="link" @click="navigateTo('/');">
        Go to Home Page
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const error = useError()

useHead({ title: error.value?.statusCode })
</script>