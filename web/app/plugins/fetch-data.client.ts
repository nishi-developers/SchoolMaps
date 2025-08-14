// Nuxtアプリの型拡張
declare module "#app" {
  interface NuxtApp {
    $modes: Ref<Mode[]>;
    $floors: Ref<Floor[]>;
    $behaviors: Ref<Behavior[]>;
    $places: Ref<Place[]>;
    $detail: Ref<Detail>;
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
  }
}

export default defineNuxtPlugin(async (nuxtApp) => {
  const [modes, floors, behaviors, places, detail] = await Promise.all([
    useFetch<Mode[]>("/api/assets/modes"),
    useFetch<Floor[]>("/api/assets/floors"),
    useFetch<Behavior[]>("/api/assets/behaviors"),
    useFetch<Place[]>("/api/assets/places"),
    useFetch<Detail>("/api/assets/detail"),
  ]);

  nuxtApp.provide("modes", modes.data as Ref<Mode[]>);
  nuxtApp.provide("floors", floors.data as Ref<Floor[]>);
  nuxtApp.provide("behaviors", behaviors.data as Ref<Behavior[]>);
  nuxtApp.provide("places", places.data as Ref<Place[]>);
  nuxtApp.provide("detail", detail.data as Ref<Detail>);
});
