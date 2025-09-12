<template>
  <VitePwaManifest />
  <NuxtRouteAnnouncer />
  <AppHeader />
  <!-- NuxtPageは各Vueファイルの一番外側のdivタグに置き換えられる -->
  <NuxtPage id="nuxt-page" :style="{
    top: `${$config.public.headerHeightPx}px`,
    height: `calc(100svh - ${$config.public.headerHeightPx}px)`
  }" />
  <!-- css内でv-bindを使えなかったため、上のように実装 -->
  <BottomNotify />
</template>

<style scoped lang="scss">
#nuxt-page {
  position: relative;
  overflow: hidden;
}

/* transition */
.page-enter-active,
.page-leave-active {
  transition: opacity .15s ease
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
