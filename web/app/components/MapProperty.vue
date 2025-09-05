<template>
  <div id="property-wrapper">
    <div v-if="place" id="property">
      <div id="titles">
        <div id="name">{{ place?.name }}</div>
        <div id="share" @click="shareLink(`西高マップ @${place?.name}`, useRequestURL().href)">
          <Icon name="share" />
          共有
        </div>
        <div id="closeBtn" @click='emit("reset-places")'>
          <Icon name="cercleClose" />
        </div>
      </div>
      <div id="labels">
        <NuxtLink v-if="$floorsChangeable.some((floor) => floor.id == place?.floor)" id="floor" class="label"
          :to="{ name: 'search', query: { q: `floor:${place?.floor}` } }">
          <Icon name="stairs" />
          {{$floorsChangeable.filter((floor) => floor.id == place?.floor)[0]?.name}}
        </NuxtLink>
        <NuxtLink v-if="$modesChangeable.some((mode) => mode.id == place?.mode)" id="mode" class="label"
          :to="{ name: 'search', query: { q: `mode:${place?.mode}` } }">
          <Icon name="tag" />
          {{$modesChangeable.filter((mode) => mode.id == place?.mode)[0]?.name}}
        </NuxtLink>
      </div>
      <div id="images" ref="imageContainer">
        <img v-for="(img, index) in place?.images" :key="index" :src="img" :alt="`${place?.name}の画像${index + 1}`"
          loading="lazy">
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div id="desc" v-html="desc.description.value" />
    </div>
  </div>
</template>
<script setup lang="ts">
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';

const { $modesChangeable, $floorsChangeable, $placesEnable } = useNuxtApp();

// propsとemitの定義
const props = defineProps<{
  places: ReadonlyArray<string>
}>()
const emit = defineEmits<(e: 'reset-places' | 'apply-url') => void>();

// 場所の情報を取得
const place = computed(() => {
  if (props.places.length !== 1) return null; // 1つだけ選択されている場合のみ表示
  return $placesEnable.value.filter(place => place.id == props.places[0])[0];
});

const desc = usePropertyDesc(
  place as Ref<Place>,
  useRequestURL(),
  () => emit('apply-url')
)

// viewer.jsの初期化処理
const imageContainer = ref<HTMLElement>();
const initViewer = () => {
  if (!imageContainer.value) return;
  new Viewer(
    imageContainer.value,
    {
      rotatable: false,
      scalable: false,
    }
  );
};

desc.initDesc();
onMounted(() => {
  if (!place.value) return;
  initViewer();
  desc.registerJumpLinkEvents();
});
</script>
<style scoped lang="scss">
// スライドは scroll-snap-type: x mandatory;を利用してうまいこと実装したい

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
    padding: 20px;

    #titles {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 10px;

      #name {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--MainBodyColor);
        overflow-wrap: break-word;
      }

      #share {
        margin-left: auto;
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        color: var(--MainBodyColor);
      }

      #closeBtn {
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        color: var(--MainBodyColor);
        border-radius: 50%;
      }
    }

    #labels {
      display: flex;
      gap: 10px;
      font-size: 1.2rem;
      margin-bottom: 10px;

      .label {
        cursor: pointer;
        display: flex;
        align-items: center;
        color: var(--MainBodyColor);
      }
    }

    #images {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      height: 250px;
      gap: 10px;
      margin-bottom: 10px;

      img {
        scroll-snap-align: center;
        height: 100%;
        border-radius: 20px;
        border: 2px solid var(--SubColor);
        cursor: zoom-in;
      }
    }

    #desc {
      font-size: 1.1rem;
      color: var(--MainBodyColor);
      overflow-wrap: break-word;
    }
  }

}
</style>