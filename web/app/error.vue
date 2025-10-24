<template>
  <AppHeader />
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
        <Icon icon="mdi:undo-variant" />
        <span>元のページに戻る</span>
      </div>
      <NuxtLink class="action" to="/">
        <Icon icon="mdi:home" />
        <span>トップに戻る</span>
      </NuxtLink>
      <div class="action" @click="reload">
        <Icon icon="mdi:reload" />
        <span>再読み込み</span>
      </div>
      <div class="action" @click="clearCache">
        <Icon icon="mdi:delete-sweep-outline" />
        <span>キャッシュのクリア</span>
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

async function clearCache() {
  if (!confirm("本当にキャッシュをクリアしますか?")) return;
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    localStorage.removeItem("mapVersion");
    window.location.reload();
  } catch (e) {
    console.error("キャッシュ削除中にエラー:", e);
  }
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