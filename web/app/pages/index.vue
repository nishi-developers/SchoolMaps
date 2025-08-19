<template>
  <div>
    <div id="map-wrapper" ref="mapWrapper" v-on="eventListener"></div>
    <p>hello world</p>
  </div>
</template>
<script setup lang="ts">
const { $map } = useNuxtApp();
useHead({ title: 'マップ' })

const mapWrapper = ref<HTMLElement | null>(null);

const mapMove = useMapMove();
const mapMoveByMouse = useMapMoveByMouse(mapMove, 0); // ヘッダーの高さは0と仮定

watch(
  () => mapMove.status,
  (newVal) => {
    // マップの位置を更新
    const mapElement = document.getElementById("map");
    if (mapElement) {
      mapElement.style.top = `${newVal.value.position.y}px`;
      mapElement.style.left = `${newVal.value.position.x}px`;
      mapElement.style.transform = `rotate(${newVal.value.rotate}deg)`;
      mapElement.style.transform += ` scale(${newVal.value.zoom})`;
    }
  },
  { immediate: true, deep: true }
);


onMounted(() => {
  // マップのSVG要素を取得して表示
  const map = $map;
  map.value.setAttribute("id", "map");
  mapWrapper.value?.appendChild(map.value);
});

let isAlreadyMoved = false; // マウス使用時のみ、移動したかどうか
const eventListener = {
  click: (event: MouseEvent) => {
    // if (!isAlreadyMoved) {
    //   Property.showByUser(event)
    // }
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
    // MapMoveByTouch.do(event)
  },
  touchstart: (event: TouchEvent) => {
    // MapMoveByTouch.start(event)
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

// search.tsも同様に、クラスではなくComposableとして実装する

// AIの例
// composables/useCounter.ts
// export const useCounter = () => {
//   const count = ref(0)
  
//   const increment = () => count.value++
//   const decrement = () => count.value--
//   const reset = () => count.value = 0
  
//   return {
//     // 状態
//     count: readonly(count),
//     // アクション
//     increment,
//     decrement,
//     reset
//   }
// }
</script>

<style>
#map{
  width: 100%;
  height: 100%;
  position: relative;
  /* これは試験用 */
  /* 実際にはこうやって書かない */
  /* top: v-bind(mapMove.status.value.position.y + 'px');
  left: v-bind(mapMove.status.value.position.x + 'px'); */
}
</style>