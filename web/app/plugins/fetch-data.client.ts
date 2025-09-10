import { ref } from "vue";

// Nuxtアプリの型拡張
declare module "#app" {
  interface NuxtApp {
    $modes: Ref<Mode[]>;
    $floors: Ref<Floor[]>;
    $behaviors: Ref<Behavior[]>;
    $places: Ref<Place[]>;
    $detail: Ref<Detail>;
    $map: Ref<SVGElement>;
    $modesEnable: Ref<Mode[]>;
    $modesChangeable: Ref<Mode[]>;
    $floorsChangeable: Ref<Floor[]>;
    $placesEnable: Ref<Place[]>;
  }
}

// Vueコンポーネントでのテンプレート内アクセス用
declare module "vue" {
  interface ComponentCustomProperties {
    $modes: Ref<Mode[]>;
    $floors: Ref<Floor[]>;
    $behaviors: Ref<Behavior[]>;
    $places: Ref<Place[]>;
    $detail: Ref<Detail>;
    $map: Ref<SVGElement>;
    $modesEnable: Ref<Mode[]>;
    $modesChangeable: Ref<Mode[]>;
    $floorsChangeable: Ref<Floor[]>;
    $placesEnable: Ref<Place[]>;
  }
}

export default defineNuxtPlugin(async (nuxtApp) => {
  console.log("Fetching map data...");

  // Service Workerの準備完了を待機
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
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
      if ("caches" in window) {
        await caches.delete("api-assets");
        await caches.delete("api-version");
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

  // 各種データの取得
  const [modes, floors, behaviors, places, detail, map_data] = await Promise.all([
    $fetch<Mode[]>("/api/assets/modes"),
    $fetch<Floor[]>("/api/assets/floors"),
    $fetch<Behavior[]>("/api/assets/behaviors"),
    $fetch<Place[]>("/api/assets/places"),
    $fetch<Detail>("/api/assets/detail"),
    $fetch<Blob>("/api/assets/map"),
  ]);

  // マップデータ(SVG)のパース
  const parser = new DOMParser();
  const map_string = await map_data.text();
  const map_element = parser.parseFromString(map_string, "image/svg+xml").querySelector("svg");

  // refでラップしてリアクティブにする
  const modesRef = ref(modes);
  const floorsRef = ref(floors);
  const behaviorsRef = ref(behaviors);
  const placesRef = ref(places);
  const detailRef = ref(detail);
  const mapRef = ref(map_element);

  // 常に有効なモード、変更可能なモード・フロアの算出
  const modesEnable = computed(() => {
    return modesRef.value.filter((mode) => mode.enable) || [];
  });
  const modesChangeable = computed(() => {
    return modesEnable.value.filter((mode) => !mode.always) || [];
  });
  const floorsChangeable = computed(() => {
    return floorsRef.value.filter((floor) => !floor.always) || [];
  });
  const placesEnable = computed(() => {
    return placesRef.value.filter((place) => modesEnable.value.some((mode) => mode.id === place.mode)) || [];
  });

  // グローバルプロパティとして提供
  nuxtApp.provide("modes", modesRef as Ref<Mode[]>);
  nuxtApp.provide("floors", floorsRef as Ref<Floor[]>);
  nuxtApp.provide("behaviors", behaviorsRef as Ref<Behavior[]>);
  nuxtApp.provide("places", placesRef as Ref<Place[]>);
  nuxtApp.provide("detail", detailRef as Ref<Detail>);
  nuxtApp.provide("map", mapRef as Ref<SVGElement>);
  nuxtApp.provide("modesEnable", modesEnable as Ref<Mode[]>);
  nuxtApp.provide("modesChangeable", modesChangeable as Ref<Mode[]>);
  nuxtApp.provide("floorsChangeable", floorsChangeable as Ref<Floor[]>);
  nuxtApp.provide("placesEnable", placesEnable as Ref<Place[]>);
});
