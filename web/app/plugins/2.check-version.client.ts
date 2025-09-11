// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sendMessageToSW(message: any): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) {
      console.log("Service Worker is not available or controlling the page.");
      return reject();
    }
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = () => resolve(); // 通信が返ってきたらresolve
    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
}

export default defineNuxtPlugin(async () => {
  // バージョンチェック（毎回取得、キャッシュなし）
  const currentVersion = await $fetch<{ v: string }>("/api/map-version");
  const cachedVersion = localStorage.getItem("mapVersion");

  if (cachedVersion && cachedVersion !== currentVersion.v) {
    // 更新が検出された場合、アラートを表示
    const shouldUpdate = confirm(
      `マップデータの更新が見つかりました。\n` +
        `現在のバージョン: ${cachedVersion}\n` +
        `最新バージョン: ${currentVersion.v}\n\n` +
        `今すぐ更新しますか？`
    );
    if (shouldUpdate) {
      // ユーザーが更新を選択した場合のみキャッシュクリア
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        // versionキャッシュは削除しない（次回アクセス時に更新を検出できなくなるため）
        // NetworkFirstなので古いキャッシュが残ってても問題ない
        await sendMessageToSW({ action: "DELETE_API_ASSETS_CACHE" });
      }
      localStorage.setItem("mapVersion", currentVersion.v);
      console.log(
        `マップバージョンが ${cachedVersion} から ${currentVersion.v} に更新されました。キャッシュをクリアしました。`
      );
    }
  } else if (!cachedVersion) {
    // 初回アクセス時はバージョンを保存
    localStorage.setItem("mapVersion", currentVersion.v);
    console.log(`初回アクセスのため、マップバージョン ${currentVersion.v} を保存しました。`);
  }
});
