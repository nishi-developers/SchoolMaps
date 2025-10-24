export default defineNuxtPlugin(async () => {
  try {
    // バージョンチェック
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
          await caches.delete("api-assets");
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
  } catch (e) {
    console.error("バージョンチェック中にエラーが発生しました:", e);
  }
});
