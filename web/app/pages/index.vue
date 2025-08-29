<template>
  <div>
    <div id="map-wrapper" ref="mapWrapper" v-on="eventListener" />
    <div id="map-ui">
      <div id="side-top">
        <div id="controls">
          <NuxtLink :to="{ name: 'search' }">
            <div>
              <Icon name="material-symbols:search-rounded" />
            </div>
          </NuxtLink>
          <div>
            <Icon name="material-symbols:reset-focus-outline-rounded" @click="mapMove.reset()" />
          </div>
          <div v-if="mapState.isShowLabel.value" @click="mapState.isShowLabel.value = false">
            <Icon name="material-symbols:label-off-outline-rounded" />
          </div>
          <div v-else @click="mapState.isShowLabel.value = true">
            <Icon name="material-symbols:label-outline-rounded" />
          </div>
        </div>
        <div id="floors">
          <div v-for="{ id, name } in mapEvent.floorsButtonData" :key="`${id}`"
            :class="{ active: mapState.status.value.floor === id }" @click="mapEvent.setFloor(id)">
            {{ name }}
          </div>
        </div>
      </div>
      <div id="side-bottom">
        <div id="modes">
          <div v-for="{ id, name } in mapEvent.modesButtonData" :key="`${id}`"
            :class="{ active: mapState.status.value.mode === id }" @click="mapEvent.setMode(id)">
            {{ name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';

useHead({ title: 'マップ' })
const config = useRuntimeConfig();
const windowSize = useWindowSize();
const viewSize = computed(() => ({
  width: windowSize.width.value,
  height: windowSize.height.value - config.public.headerHeightPx,
})) as Ref<ViewSize>;

const mapWrapper = ref<HTMLElement>()

const mapMove = useMapMove(viewSize);
const mapMoveByMouse = useMapMoveByMouse(mapMove, config.public.headerHeightPx);
const mapMoveByTouch = useMapMoveByTouch(mapMove, config.public.headerHeightPx);
const mapState = useMapState();
const mapView = useMapView(mapState.status, mapMove.status, mapState.isShowLabel);
const mapEvent = useMapEvent(mapState, mapState.setPlaces);

mapState.url2status(); // URLから状態を復元

onMounted(() => {
  if (!mapWrapper.value) {
    console.error("mapWrapper is not defined");
    return;
  }
  mapView.init(mapWrapper.value);
  mapMove.reset();

  // マウスホイールのイベントをキャッチするために、passive: falseを設定
  document.body.addEventListener('touchmove', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });
});

let isAlreadyMoved = false; // マウス使用時のみ、移動したかどうか
const eventListener = {
  click: (event: MouseEvent) => {
    if (!isAlreadyMoved) {
      mapEvent.clickPlace(event);
    }
  },
  mousemove: (event: MouseEvent) => {
    mapMoveByMouse.moveMouse(event)
    if (event.buttons != 0) {
      isAlreadyMoved = true
    }
  },
  mousedown: () => {
    isAlreadyMoved = false
  },
  mouseup: () => {
    mapMoveByMouse.finishRotate()
    mapMove.doSlide("position")
    mapMove.doSlide("rotate")
  },
  touchmove: (event: TouchEvent) => {
    mapMoveByTouch.move(event)
  },
  touchstart: (event: TouchEvent) => {
    mapMoveByTouch.init(event)
  },
  touchend: () => {
    mapMove.doSlide("position")
    mapMove.doSlide("zoom")
    mapMove.doSlide("rotate")
  },
  touchcancel: () => {
    mapMove.doSlide("position")
    mapMove.doSlide("zoom")
    mapMove.doSlide("rotate")
  },
  wheel: (event: WheelEvent) => {
    mapMoveByMouse.moveWheel(event)
  },
};


// mapMoveの範囲外検知とcenterは未実装

// 方針
// クラス内で別クラスの関数を呼び出さない
// 純粋関数っぽく、全部メインスレッドに戻り値を返す
// クラス内で変数を持つのだけは許可
// Composablesを使って、状態とロジックを分離
</script>

<style scoped lang="scss">
/* #map {
  width: 100%;
  height: 100%;
  position: relative;
  /* これは試験用 */
/* 実際にはこうやって書かない */
/* top: v-bind(mapMove.status.value.position.y + 'px');
  left: v-bind(mapMove.status.value.position.x + 'px'); */
/* } */

#map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

#map-ui {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  #side-top {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 30px;

    a {
      text-decoration: none;
      color: inherit;
    }

    #controls div {
      font-size: 1.75rem;
    }

    #floors div {
      font-size: 1.25rem;
    }

    #floors div.active {
      background-color: var(--SubColor);
    }

    #controls,
    #floors {
      flex-direction: column;
      display: flex;
      gap: 10px;

      div {
        background-color: var(--SubBaseColor);
        border-radius: 5px;
        padding: 5px;
        cursor: pointer;
        pointer-events: auto;

        display: flex;
        align-items: center;
        justify-content: center;

        width: 45px;
        height: 45px;

        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: background-color 0.3s;

        @media (hover: hover) {
          &:hover {
            background-color: var(--SubColor);
          }
        }

        &:active {
          background-color: var(--SubColor);
        }
      }
    }
  }

  #side-bottom {
    position: absolute;
    bottom: 10px;
    right: 10px;

    #modes {
      display: flex;
      gap: 10px;

      div {
        background-color: var(--SubBaseColor);
        border-radius: 5px;
        padding: 5px 10px;
        cursor: pointer;
        pointer-events: auto;

        display: flex;
        align-items: center;
        justify-content: center;

        font-size: 1.25rem;
        height: 35px;

        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: background-color 0.3s;

        @media (hover: hover) {
          &:hover {
            background-color: var(--SubColor);
          }
        }

        &:active {
          background-color: var(--SubColor);
        }
      }

      div.active {
        background-color: var(--SubColor);
      }
    }
  }
}
</style>