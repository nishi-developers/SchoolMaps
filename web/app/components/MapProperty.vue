<template>
  <div id="property-wrapper">
    <div v-if="place" id="property">
      <div @click='emit("reset-places")'>
        <Icon name="material-symbols:close-rounded" />
        <!-- 閉じるボタンとバーを併用予定 -->
      </div>
      <div id="titles">
        <div id="name">{{ place?.name }}</div>
        <div @click="shareLink(`西高マップ @${place?.name}`, requestURL.href)">
          <Icon name="material-symbols:share" />
          共有
        </div>
      </div>
      <div id="labels">
        <div id="floor">
          <Icon name="material-symbols:stairs-2-rounded" />
          {{$floorsChangeable.filter((floor) => floor.id == place?.floor)[0]?.name}}
        </div>
        <div v-if="$modesChangeable.some((mode) => mode.id == place?.mode)" id="mode">
          <Icon name="material-symbols:tag-rounded" />
          {{$modesChangeable.filter((mode) => mode.id == place?.mode)[0]?.name}}
        </div>
      </div>
      <div ref="imageContainer">
        <img v-for="(img, index) in place?.images" :key="index" :src="img" :alt="`${place?.name}の画像${index + 1}`"
          loading="lazy">
      </div>
      <div id="desc" v-html="description" />
    </div>
  </div>
</template>
<script setup lang="ts">
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';

const { $modesChangeable, $floorsChangeable, $placesEnable } = useNuxtApp();
const requestURL = useRequestURL()

// propsとemitの定義
const props = defineProps<{
  places: ReadonlyArray<string>
}>()
const emit = defineEmits<{
  (e: 'reset-places'): void
}>()

// 場所の情報を取得
const place = computed(() => {
  if (props.places.length !== 1) return null; // 1つだけ選択されている場合のみ表示
  return $placesEnable.value.filter(place => place.id == props.places[0])[0];
});

// 説明の初期化処理
// jump
// [校庭](grand)というように囲まれた部分をリンクとして扱う
// bold
// **bold**というように囲まれた部分を太字として扱う
// new line
// /nという文字列を改行として扱う
const description = ref("");
const jumpUrls = ref<Array<string>>([]);
const initDesc = () => {
  jumpUrls.value = [];
  if (!place.value) return;
  description.value = place.value.desc;
  description.value = description.value.replace(/\/n/g, "<br>");
  description.value = description.value.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // description.value = description.value.replace(/\[(.+?)\]\((.+?)\)/g, `<a href="#${"$placesEnable".value.some(place => place.id == "$2") ? "$2" : ""}" @click.prevent="emit('reset-places'); $nextTick(() => { const el = document.getElementById('$2'); if (el) el.scrollIntoView({ behavior: 'smooth' }); })">$1</a>`);
  description.value = description.value.replace(/\[(.+?)\]\((.+?)\)/g, (match, name, url) => {
    jumpUrls.value.push(url);
    return `<a href="${url}" id="jumpUrl-${jumpUrls.value.length - 1}">${name}</a>`;
  });
  nextTick(() => {
    registerJumpLinks();
  });
};

const registerJumpLinks = () => {
  jumpUrls.value.forEach((url, index) => {
    const el = document.getElementById(`jumpUrl-${index}`);
    if (el) {
      el.addEventListener('click', async (e) => {
        e.preventDefault();
        // これじゃあ更新されない
        // あと外部リンクの対応
        await navigateTo(url);
      });
    }
  });
};

// viewer.jsの初期化処理
const imageContainer = ref<HTMLElement>();
let viewer: Viewer | null = null;
const initViewer = () => {
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
  if (!imageContainer.value) return;
  viewer = new Viewer(
    imageContainer.value,
    {
      rotatable: false,
      scalable: false,
    }
  );
};

// ライフサイクル
watch(place, () => {
  nextTick(() => {
    if (!place.value) return;
    initDesc();
    initViewer();
  });
}, { immediate: false });
onMounted(() => {
  if (!place.value) return;
  initDesc();
  initViewer();
});
onBeforeUnmount(() => {
  if (!place.value) return;
  if (viewer) {
    viewer.destroy();
  }
});

</script>
<style scoped lang="scss">
#property-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 20;
  pointer-events: none;

  #property {
    touch-action: pan-x pan-y;
    user-select: text;
    overflow: scroll;
    pointer-events: auto;

    position: absolute;
    bottom: 0;
    width: 100%;
    height: 30%;
    background-color: var(--SubBaseColor);
  }

}
</style>