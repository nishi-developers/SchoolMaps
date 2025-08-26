<template>
  <div>
    <div id="map-wrapper" ref="mapWrapper" v-on="eventListener" />
    <div id="map-ui">
      <div id="controls">
        <div>
          <Icon name="material-symbols:search-rounded" @click="async () => {
            await navigateTo({
              name: 'search',
            })
          }" />
        </div>
        <div>
          <Icon name="material-symbols:reset-focus-outline-rounded" @click="mapMove.reset()" />
        </div>
        <div v-if="mapEvent.isShowLabel.value" @click="mapEvent.setIsShowLabel(false)">
          <Icon name="material-symbols:label-off-outline-rounded" />
        </div>
        <div v-else @click="mapEvent.setIsShowLabel(true)">
          <Icon name="material-symbols:label-outline-rounded" />
        </div>
      </div>
      <div id="floors">
        <div>1階</div>
        <div>2階</div>
        <div>3階</div>
      </div>
      <div id="modes">
        <div>通常</div>
        <div>文化祭</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'マップ' })

const mapWrapper = ref<HTMLElement>()

const mapMove = useMapMove();
const mapMoveByMouse = useMapMoveByMouse(mapMove, 0); // ヘッダーの高さは0と仮定
const mapMoveByTouch = useMapMoveByTouch(mapMove, 0); // ヘッダーの高さは0と仮定
const mapStatus = useMapStatus();
const mapEvent = useMapEvent(mapStatus.status, mapStatus.setPlaces);
const mapView = useMapView(mapStatus.status, mapMove.status, mapEvent.isShowLabel);

mapStatus.url2status(); // URLから状態を復元

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

  #controls {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: auto;

    div {
      background-color: var(--SubBaseColor);
      border-radius: 5px;
      padding: 5px;
      cursor: pointer;
      font-size: 1.75rem;

      display: flex;
      align-items: center;
      justify-content: center;

      width: 45px;
      height: 45px;

      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: background-color 0.3s;

      &:hover {
        background-color: var(--SubColor);
      }

      &:active {
        background-color: var(--SubColor);
      }
    }
  }
}
</style>