<template>
  <div class="background text widthLimit">
    <div v-if="error?.statusCode === 404">
      <p class="textTitle">404 Not Found</p>
      <p class="textH">お探しのページは見つかりませんでした。</p>
      <p class="textP">
        お探しのページは削除されたか、URLが変更された可能性があります。
      </p>
    </div>
    <div v-else>
      <h2 class="status">{{ error?.statusCode }}</h2>
      <h3>{{ error?.message }}</h3>
      <p class="link" @click="$router.go(-1);">
        Back to Previous Page
      </p>
      <p class="link" @click="$router.push('/');">
        Go to Home Page
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const error = useError()
</script>