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
    useFetch<Mode[]>("/api/assets/modes"),
    useFetch<Floor[]>("/api/assets/floors"),
    useFetch<Behavior[]>("/api/assets/behaviors"),
    useFetch<Place[]>("/api/assets/places"),
    useFetch<Detail>("/api/assets/detail"),
    useFetch<Blob>("/api/assets/map"),
  ]);

  // マップデータ(SVG)のパース
  const parser = new DOMParser();
  const map_blob = map_data.data.value as Blob;
  const map_string = await map_blob.text();
  const map_element = parser.parseFromString(map_string, "image/svg+xml").querySelector("svg");

  // 常に有効なモード、変更可能なモード・フロアの算出
  const modesEnable = computed(() => {
    return modes.data.value?.filter((mode) => mode.enable) || [];
  });
  const modesChangeable = computed(() => {
    return modesEnable.value.filter((mode) => !mode.always) || [];
  });
  const floorsChangeable = computed(() => {
    return floors.data.value?.filter((floor) => !floor.always) || [];
  });
  const placesEnable = computed(() => {
    return places.data.value?.filter((place) => modesEnable.value.some((mode) => mode.id === place.mode)) || [];
  });

  // グローバルプロパティとして提供
  nuxtApp.provide("modes", modes.data as Ref<Mode[]>);
  nuxtApp.provide("floors", floors.data as Ref<Floor[]>);
  nuxtApp.provide("behaviors", behaviors.data as Ref<Behavior[]>);
  nuxtApp.provide("places", places.data as Ref<Place[]>);
  nuxtApp.provide("detail", detail.data as Ref<Detail>);
  nuxtApp.provide("map", ref(map_element) as Ref<SVGElement>);
  nuxtApp.provide("modesEnable", modesEnable as Ref<Mode[]>);
  nuxtApp.provide("modesChangeable", modesChangeable as Ref<Mode[]>);
  nuxtApp.provide("floorsChangeable", floorsChangeable as Ref<Floor[]>);
  nuxtApp.provide("placesEnable", placesEnable as Ref<Place[]>);
});
