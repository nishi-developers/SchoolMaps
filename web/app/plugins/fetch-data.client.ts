export default defineNuxtPlugin(async (nuxtApp) => {
  const [modes, floors, behaviors, places, detail] = await Promise.all([
    useFetch("/api/assets/modes"),
    useFetch("/api/assets/floors"),
    useFetch("/api/assets/behaviors"),
    useFetch("/api/assets/places"),
    useFetch("/api/assets/detail"),
  ]);

  nuxtApp.provide("modes", modes.data);
  nuxtApp.provide("floors", floors.data);
  nuxtApp.provide("behaviors", behaviors.data);
  nuxtApp.provide("places", places.data);
  nuxtApp.provide("detail", detail.data);
});
