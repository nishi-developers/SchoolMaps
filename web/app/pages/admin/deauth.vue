<template>
  <div>
    <h1>認証解除</h1>
  </div>
</template>
<script setup lang="ts">
useHead({ title: '認証解除' })
const router = useRouter()
if (confirm('認証を解除しますか?')) {
  fetch('/api/deauth', {
    method: 'POST',
  }).then(async (res) => {
    if (res.ok) {
      alert('認証を解除しました。')
      router.push({ path: '/about' })
    } else {
      alert(`認証解除に失敗しました。`)
      router.go(-1)
    }
  })
} else {
  router.go(-1)
}
</script>