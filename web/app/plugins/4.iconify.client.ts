import { Icon as IconifyIcon, addIcon } from "@iconify/vue";

declare module "vue" {
  interface GlobalComponents {
    Icon: typeof IconifyIcon;
  }
}

const iconAliases = {
  share: "mdi:share",
  close: "mdi:close",
  cercleClose: "mdi:close-circle-outline",
  stairs: "mdi:stairs",
  tag: "mdi:tag-outline",
  search: "mdi:search",
  label: "mdi:label-outline",
  labelOff: "mdi:label-off-outline",
  resetFocus: "mdi:focus-field",
  searchOnMap: "mdi:map-search-outline",
  back: "mdi:undo-variant",
  reload: "mdi:reload",
  home: "mdi:home",
  deleteSweep: "mdi:delete-sweep-outline",
} as const;

for (const [alias, original] of Object.entries(iconAliases)) {
  // bodyを空にすると自動的にCDNから取得される
  addIcon(alias, { body: "", name: original });
  // setAlias(alias, original);
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("Icon", IconifyIcon);
});
