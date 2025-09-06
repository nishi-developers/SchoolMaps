<template>
  <div id="property-wrapper">
    <div v-if="place" id="property" :class="deviceMode">
      <div id="slider" v-on="propertySlide.eventListener" />
      <div id="property-inner">
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
  </div>
</template>
<script setup lang="ts">
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';

const { $modesChangeable, $floorsChangeable, $placesEnable } = useNuxtApp();

// propsとemitの定義
const props = defineProps<{
  places: ReadonlyArray<string>
  viewsize: ViewSize
}>()
const emit = defineEmits<(e: 'reset-places' | 'apply-url') => void>();

const deviceMode = computed(() => (props.viewsize.width < props.viewsize.height ? 'mobile' : 'pc') as 'mobile' | 'pc');

// 場所の情報を取得
const place = computed(() => {
  if (props.places.length !== 1) return null; // 1つだけ選択されている場合のみ表示
  return $placesEnable.value.filter(place => place.id == props.places[0])[0];
});

// 説明文の処理
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

// property sliderの処理
const propertySlide = usePropertySlider(
  deviceMode as Ref<'mobile' | 'pc'>,
  props,
  () => emit('reset-places')
);
// このコンポーネント内でcomputedしないと、cssのv-bindで認識されない
const propertySize = computed(() => propertySlide.propertySize.value);

// ライフサイクルフックなど
desc.initDesc();
onMounted(() => {
  if (!place.value) return;
  initViewer();
  desc.registerJumpLinkEvents();
  propertySlide.addEventListeners();
});
onUnmounted(() => {
  propertySlide.removeEventListeners();
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
    position: absolute;
    background-color: var(--SubBaseColor);
    display: flex;
    gap: 5px;
    pointer-events: auto;

    &.mobile {
      width: 100%;
      height: v-bind("propertySize + 'px'");
      border-radius: 20px 20px 0 0;
      bottom: 0;
      flex-direction: column;

      #slider {
        width: 200px;
        height: 25px;
        margin: 0 auto;
      }

      #property-inner {
        padding: 5px 20px 20px 20px;
      }
    }

    &.pc {
      width: v-bind("propertySize + 'px'");
      height: 100%;
      border-radius: 0 20px 20px 0;
      bottom: 0;
      flex-direction: row-reverse;

      #slider {
        width: 25px;
        height: 200px;
        margin: auto 0;
      }

      #property-inner {
        padding: 20px 5px 20px 20px;
      }
    }

    #slider {
      border-radius: 15px;
      background-color: var(--MainColor);
      cursor: pointer;

      @media (hover: hover) {
        &:hover {
          background-color: var(--SubColor);
        }
      }

      &:active {
        background-color: var(--SubColor);
      }
    }

    #property-inner {
      width: 100%;
      height: 100%;
      overflow: scroll;
      touch-action: pan-x pan-y;
      user-select: text;

      #titles {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        white-space: nowrap;

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
        white-space: nowrap;

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
}
</style>