<template>
    <Transition name="bottomnotify" appear>
        <div v-if="isShow" id="bottomNotify">
            <div class="desc">
                アプリをインストールして、オフラインでもマップを使いませんか?
            </div>
            <div id="installBtn" @click="install">インストール</div>
            <Icon id="hideBtn" name="close" @click="hide" />
        </div>
    </Transition>
</template>
<script setup lang="ts">
const isShowInstallPrompt = useCookie('isShowInstallPrompt', {
    default: () => 'true', // デフォルトは表示する
    maxAge: 60 * 60 * 24 * 30, // 30日間有効
});

const isShow = ref(false);

let installPromptEvent

// https://qiita.com/anoChick/items/50673084c78c98ce64b7
window.addEventListener('beforeinstallprompt', (event) => {
    // Chrome67以前で自動的にプロンプトを表示しないようにする?
    event.preventDefault();
    // if (isShowInstallPrompt.value === 'false') {
    //     // すでに非表示にしている場合は何もしない
    //     return;
    // }
    // イベントを変数に保存する
    installPromptEvent = event;
    // #btnを活性に
    isShow.value = true;
});

function install() {
    isShow.value = false; // キャンセルされた場合はもう一度"beforeinstallprompt"イベントが発火するため、非表示にする
    // プロンプトを表示
    installPromptEvent.prompt();
    // ユーザーが何を選択したかを取得
    installPromptEvent.userChoice.then((
        // choiceResult
    ) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
        } else {
            console.log('User dismissed the A2HS prompt');
        }
        // プロンプトを削除
        installPromptEvent = null;
    });
}

function hide() {
    isShow.value = false;
    isShowInstallPrompt.value = 'false'; // Cookieも更新
}
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
    border-radius: 15px;
    z-index: 100;
    background-color: var(--SubColor);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    gap: 5px;
    color: var(--SubBodyColor);
}

#bottomNotify:not(.bottomnotify-enter-active):not(.bottomnotify-leave-active) {
    opacity: 0.75;
}

.desc {
    font-size: 1rem;
}

#installBtn {
    font-size: 1.1rem;
    cursor: pointer;
    white-space: nowrap;
    background-color: var(--MainBaseColor);
    border-radius: 15px;
    width: 110px;
    min-width: 110px;
    padding: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
}

#hideBtn {
    font-size: 1.5rem;
    cursor: pointer;
    position: absolute;
    right: 10px;
    top: 5px;
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
