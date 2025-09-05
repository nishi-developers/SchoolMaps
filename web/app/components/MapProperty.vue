<template>
  <div id="property-wrapper">
    <div v-if="place" id="property" :class="deviceMode">
      <div id="slider" v-on="eventListener" />
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

const propertySize = ref(0);
const propertySizeMiddleRate = 0.3; // 中間サイズの割合
const propertySizeMaxRate = 0.9; // 最大サイズの割合
// 初回時またはモード変更時にサイズをリセット
watch(deviceMode, (mode) => {
  if (mode === 'mobile') {
    propertySize.value = props.viewsize.height * propertySizeMiddleRate;
  } else {
    propertySize.value = props.viewsize.width * propertySizeMiddleRate;
  }
}, { immediate: true });

let isAlreadyMoved = false; // マウス使用時のみ、移動したかどうか
const eventListener = {
  click: () => {
    if (!isAlreadyMoved) {
      emit('reset-places');
    }
  },
  mousemove: (event: MouseEvent) => {
    if (event.buttons == 1) {
      isAlreadyMoved = true
      mouseMove(event);
    }
  },
  mousedown: () => {
    isAlreadyMoved = false
  },
  mouseup: () => {
    leave()
  },
  touchmove: (event: TouchEvent) => {
    if (event.changedTouches.length === 1) {
      touchMove(event);
    }
  },
  touchstart: (event: TouchEvent) => {
    if (event.changedTouches.length === 1) {
      touchStart(event);
    }
  },
  touchend: () => {
    leave()
  },
  touchcancel: () => {
    leave()
  },
};

function mouseMove(event: MouseEvent) {
  // マウスでドラッグ中の処理
  if (deviceMode.value == "mobile") {
    if (propertySize.value - event.movementY > 0 && propertySize.value - event.movementY < props.viewsize.height)
      propertySize.value -= event.movementY;
  } else {
    if (propertySize.value + event.movementX > 0 && propertySize.value + event.movementX < props.viewsize.width)
      propertySize.value += event.movementX;
  }
}

function leave() {
  // マウス・タッチが離れたときの処理
  if (deviceMode.value == "mobile") {
    if (propertySize.value < props.viewsize.height * propertySizeMiddleRate / 2) {
      // 閉じる
      emit('reset-places');
    } else if (propertySize.value > (((props.viewsize.height * propertySizeMiddleRate) + (props.viewsize.height * propertySizeMaxRate)) / 2)) {
      // 最大化
      propertySize.value = props.viewsize.height * propertySizeMaxRate
    } else {
      propertySize.value = props.viewsize.height * propertySizeMiddleRate
    }
  } else {
    if (propertySize.value < props.viewsize.width * propertySizeMiddleRate / 2) {
      // 閉じる
      emit('reset-places')
    } else if (propertySize.value > (((props.viewsize.width * propertySizeMiddleRate) + (props.viewsize.width * propertySizeMaxRate)) / 2)) {
      // 最大化
      propertySize.value = props.viewsize.width * propertySizeMaxRate
    } else {
      propertySize.value = props.viewsize.width * propertySizeMiddleRate
    }
  }
}
let touchLast = 0;
function touchStart(event: TouchEvent) {
  // タッチでドラッグ開始時の処理
  if (deviceMode.value == "mobile") {
    touchLast = event.changedTouches[0]?.clientY || 0;
  } else {
    touchLast = event.changedTouches[0]?.clientX || 0;
  }
}
function touchMove(event: TouchEvent) {
  // タッチでドラッグ中の処理
  if (deviceMode.value == "mobile") {
    const Y = touchLast - (event.changedTouches[0]?.clientY || 0)
    touchLast = event.changedTouches[0]?.clientY || 0
    if (propertySize.value + Y > 0 && propertySize.value + Y < props.viewsize.height)
      propertySize.value += Y;
  } else {
    const X = touchLast - (event.changedTouches[0]?.clientX || 0)
    touchLast = event.changedTouches[0]?.clientX || 0
    if (propertySize.value - X > 0 && propertySize.value - X < props.viewsize.width)
      propertySize.value -= X;
  }
}
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
    pointer-events: auto;
    position: absolute;
    background-color: var(--SubBaseColor);
    display: flex;
    gap: 5px;

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

      #titles {
        display: flex;
        align-items: center;
        gap: 10px;
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
}
</style>