import { Icon as IconifyIcon } from "@iconify/vue";

declare module "vue" {
  interface GlobalComponents {
    Icon: typeof IconifyIcon;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("Icon", IconifyIcon);
});
