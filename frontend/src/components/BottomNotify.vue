<template>
    <Transition name="bottomnotify" appear>
        <div id="bottomNotify" v-if="isShow">
            <div class="desc">
                アプリをインストールして、オフラインでもマップを使いませんか?
            </div>
            <div id="installBtn" @click="install">インストール</div>
            <font-awesome-icon id="hideBtn" :icon="['fas', 'xmark']" @click="hide" />
        </div>
    </Transition>
</template>
<script setup>
import { ref } from 'vue';
import Cookies from 'js-cookie';

const isShow = ref(false);

let installPromptEvent;

// https://qiita.com/anoChick/items/50673084c78c98ce64b7
window.addEventListener('beforeinstallprompt', (event) => {
    // Chrome67以前で自動的にプロンプトを表示しないようにする?
    event.preventDefault();
    if (Cookies.get('isShowInstallPrompt') === 'false') {
        // すでに非表示にしている場合は何もしない
        return;
    }
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
    installPromptEvent.userChoice.then((choiceResult) => {
        // if (choiceResult.outcome === 'accepted') {
        //     console.log('User accepted the A2HS prompt');
        // } else {
        //     console.log('User dismissed the A2HS prompt');
        // }
        // プロンプトを削除
        installPromptEvent = null;
    });
}

function hide() {
    isShow.value = false;
    Cookies.set('isShowInstallPrompt', 'false', { expires: 30 });
}
</script>
<style scoped>
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
    box-sizing: border-box;
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
