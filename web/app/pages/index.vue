<template>
  <div>
    <div id="map-wrapper" ref="mapWrapper" v-on="eventListener" />
    <div>
      <div>1</div>
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
const mapView = useMapView(mapStatus.status, mapMove.status);
const mapEvent = useMapEvent(mapStatus.status, mapStatus.setPlaces);

mapStatus.url2status(); // URLから状態を復元

onMounted(() => {
  if (!mapWrapper.value) {
    console.error("mapWrapper is not defined");
    return;
  }
  mapView.init(mapWrapper.value);

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

<style>
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
</style>