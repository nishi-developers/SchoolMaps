<template>
  <div class="page">
    <div v-if="error?.statusCode === 404" class="info">
      <h1>404 Not Found</h1>
      <h2>お探しのページは見つかりませんでした。</h2>
      <p class="message">
        お探しのページは削除されたか、URLが変更された可能性があります。
      </p>
    </div>
    <div v-else class="info">
      <h1>
        {{ error?.statusCode + ' ' + (error?.statusMessage || 'エラー') }}
      </h1>
      <h2>予期しないエラーが発生しました。</h2>
      <p class="message">{{ error?.message || 'エラーが発生しました。' }}</p>
    </div>
    <div class="actions">
      <div class="action" @click="back">
        <Icon name="back" />
        <span>元のページに戻る</span>
      </div>
      <NuxtLink class="action" to="/">
        <Icon name="home" />
        <span>トップに戻る</span>
      </NuxtLink>
      <div class="action" @click="reload">
        <Icon name="reload" />
        <span>再読み込み</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components';

const error = useError()
const router = useRouter()

useHead({
  title: error.value?.statusCode,
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

function back() {
  router.back()
}

function reload() {
  window.location.reload();
}
</script>
<style scoped lang="scss">
.info {
  .message {
    font-size: 1.2rem;
    color: var(--TextSecondaryColor);
    margin-top: 10px;
  }
}

.actions {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 1.25rem;

  .action {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: var(--LinkBodyColor);
    gap: 3px;
    text-decoration: none;

    @media (hover: hover) {
      &:hover {
        text-decoration: underline;
      }
    }

    &:active {
      text-decoration: underline;
    }
  }

}
</style>