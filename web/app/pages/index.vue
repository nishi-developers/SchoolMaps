<template>
  <div>
    <div id="map-wrapper" v-on="eventListener"></div>
    <p>hello world</p>
  </div>
</template>
<script setup lang="ts">
const { $modes, $floors, $behaviors, $places, $detail, $map } = useNuxtApp();

onMounted(() => {
  // マップのSVG要素を取得して表示
  const map = $map;
  map.value.setAttribute("id", "map");
  document.getElementById("map-wrapper")?.appendChild(map.value);
});

const eventListener = {
  click: (e: MouseEvent) => {
    console.log("Map clicked", e);
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