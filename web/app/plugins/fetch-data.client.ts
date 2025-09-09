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
  const [modes, floors, behaviors, places, detail, map_data] = await Promise.all([
    $fetch<Mode[]>("/api/assets/modes", {
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }),
    $fetch<Floor[]>("/api/assets/floors", {
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }),
    $fetch<Behavior[]>("/api/assets/behaviors", {
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }),
    $fetch<Place[]>("/api/assets/places", {
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }),
    $fetch<Detail>("/api/assets/detail", {
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }),
    $fetch<Blob>("/api/assets/map", {
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }),
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
