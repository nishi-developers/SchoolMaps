<template>
  <div>
    <div class="page">
      <h1>管理者認証</h1>
      <form @submit.prevent="submit">
        <input v-model="password" type="password" placeholder="パスワードを入力してください">
        <button type="submit">送信</button>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
useHead({ title: '認証' })
const router = useRouter()
const password = ref('')
function submit() {
  fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: password.value }),
  }).then(async (res) => {
    if (res.ok) {
      alert('認証に成功しました。')
      router.push({ path: '/admin' })
    } else {
      alert(`認証に失敗しました。`)
    }
  })
}
</script>