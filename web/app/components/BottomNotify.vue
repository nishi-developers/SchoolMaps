<template>
  <Transition name="bottomnotify" appear>
    <div v-if="isShowNotify" id="bottomNotify">
      <div id="desc">
        <span>アプリを</span><span>インストールして、</span><span>オフラインでも</span><span>マップを</span><span>使いませんか?</span>
      </div>
      <div id="installBtn" @click="install()">インストール</div>
      <Icon id="hideBtn" name="close" @click="hide()" />
    </div>
  </Transition>
</template>
<script setup lang="ts">
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const isShowByCookie = useCookie('isShowinstallPwaNotify', {
  default: () => 'true', // デフォルトは表示する
  maxAge: 60 * 60 * 24 * 30, // 30日間有効
});
const isShowNotify = ref(false);
let installPromptEvent: BeforeInstallPromptEvent | null = null;

// https://qiita.com/anoChick/items/50673084c78c98ce64b7
window.addEventListener('beforeinstallprompt', (event) => {
  // Chrome67以前で自動的にプロンプトを表示しないようにする?
  event.preventDefault();
  installPromptEvent = event as BeforeInstallPromptEvent;
  if (isShowByCookie.value.toString() != 'false') {
    // まだインストール通知を非表示にしていない場合のみ表示
    isShowNotify.value = true;
    return;
  }
});

function install() {
  isShowNotify.value = false; // キャンセルされた場合はもう一度"beforeinstallprompt"イベントが発火するため、非表示にする
  installPromptEvent?.prompt(); // プロンプトを表示
  installPromptEvent?.userChoice.then(() => {
    // 引数にchoiceResultを受け取ると、choiceResult.outcomeでユーザーの選択(accepted or dismissed)を取得できる
    installPromptEvent = null;
  });
}

function hide() {
  isShowNotify.value = false;
  isShowByCookie.value = 'false';
}

useState("installPwa", () => install)
</script>
<style scoped lang="scss">
#bottomNotify {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 800px;
  min-height: 75px;
  border-radius: 10px;
  z-index: 50;
  background-color: var(--SubColor);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  gap: 5px;
  color: var(--SubBodyColor);
  box-shadow: 0 0 3px 2px var(--ShadowColor);

  &:not(.bottomnotify-enter-active):not(.bottomnotify-leave-active) {
    opacity: 1;
  }


  #desc {
    font-size: 1rem;
    display: flex;
    flex-wrap: wrap;
  }

  #installBtn {
    font-size: 1.1rem;
    cursor: pointer;
    white-space: nowrap;
    background-color: var(--MainBaseColor);
    border-radius: 10px;
    width: 110px;
    min-width: 110px;
    padding: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: auto;

    @media (hover: hover) {
      &:hover {
        background-color: var(--MainColor);
      }
    }

    &:active {
      background-color: var(--MainColor);
    }
  }

  #hideBtn {
    font-size: 1.5rem;
    cursor: pointer;
    position: absolute;
    right: 10px;
    top: 5px;
    margin-bottom: auto;
  }
}

/* transition */
.bottomnotify-enter-active,
.bottomnotify-leave-active {
  transition: opacity 0.3s ease;
}

.bottomnotify-enter-from,
.bottomnotify-leave-to {
  opacity: 0;
}

.bottomnotify-enter-to,
.bottomnotify-leave-from {
  opacity: 0.75;
}
</style>
