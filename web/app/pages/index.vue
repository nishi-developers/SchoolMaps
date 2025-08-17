<template>
  <div>
    <div id="map-wrapper" v-on="eventListener"></div>
    <p>hello world</p>
  </div>
</template>
<script setup lang="ts">
const { $modes, $floors, $behaviors, $places, $detail, $map } = useNuxtApp();
useHead({ title: 'マップ' })

const mapMove = useMapMove();
const mapMoveByMouse = useMapMoveByMouse(mapMove);

watch(
  () => mapMove.status.value.position,
  (newPosition) => {
    // マップの位置を更新
    const mapElement = document.getElementById("map");
    if (mapElement) {
      mapElement.style.top = `${newPosition.y}px`;
      mapElement.style.left = `${newPosition.x}px`;
    }
  },
  { immediate: true, deep: true }
);


onMounted(() => {
  // マップのSVG要素を取得して表示
  const map = $map;
  map.value.setAttribute("id", "map");
  document.getElementById("map-wrapper")?.appendChild(map.value);

  // // mapMove.reset(); // 初期化
  // setTimeout(() => {
  //   mapMove.movePosition(100, 100); // 初期位置を設定
  // }, 500); // 少し待ってから初期位置を設定
  // setTimeout(() => {
  //   mapMove.movePosition(110, 110); // 初期位置を設定
  // }, 505); // 少し待ってから初期位置を設定
  // setTimeout(() => {
  //   mapMove.doSlide("position"); // スライド開始
  // }, 700); // 少し待ってからスライド開始
});

let isAlreadyMoved = false; // マウス使用時のみ、移動したかどうか
const eventListener = {
  click: (event: MouseEvent) => {
    // if (!isAlreadyMoved) {
    //   Property.showByUser(event)
    // }
  },
  mousemove: (event: MouseEvent) => {
    mapMoveByMouse.move(event)
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
    console.log(event);
    
    mapMoveByMouse.wheel(event)
  },
};


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