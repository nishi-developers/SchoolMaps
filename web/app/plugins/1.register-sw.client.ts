export default defineNuxtPlugin(async () => {
  // Service Workerの準備完了を待機
  if ("serviceWorker" in navigator) {
    // 開発環境はdev-sw.js、本番環境はsw.jsを登録
    try {
      // 開発環境かどうかで分岐
      const swUrl = import.meta.dev ? "/dev-sw.js?dev-sw" : "/sw.js";
      const registration = await navigator.serviceWorker.register(swUrl, { scope: "/" }); // type: "module"を追加するとChromeでバグる(リロードループ)
      if (registration.active) {
        // 既存のService Workerがアクティブな場合は即座に進む
        console.log("Service Worker is already active");
      } else {
        // 新規インストールの場合のみ待機
        await navigator.serviceWorker.ready;
        console.log("Service Worker is ready");
      }
      if (!navigator.serviceWorker.controller) {
        // Service Workerがページをコントロールするまで待機
        console.log("Waiting for Service Worker to control the page...");
        await new Promise((resolve) => setTimeout(resolve, 100)); // 少し待機してからリクエストを実行
      }
    } catch (error) {
      console.warn("Service Worker registration failed:", error);
    }
  }
});
