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

  nuxtApp.provide("modes", modes.data as Ref<Mode[]>);
  nuxtApp.provide("floors", floors.data as Ref<Floor[]>);
  nuxtApp.provide("behaviors", behaviors.data as Ref<Behavior[]>);
  nuxtApp.provide("places", places.data as Ref<Place[]>);
  nuxtApp.provide("detail", detail.data as Ref<Detail>);
  nuxtApp.provide("map", ref(map_element) as Ref<SVGElement>);
});
