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
      <div id="desc">
        {{ place?.desc }}
      </div>
      <div id="images"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $modesChangeable, $floorsChangeable, $placesEnable } = useNuxtApp();
const requestURL = useRequestURL()

const props = defineProps<{
  places: ReadonlyArray<string>
}>()
const emit = defineEmits<{
  (e: 'reset-places'): void
}>()

const place = computed(() => {
  if (props.places.length !== 1) return null; // 1つだけ選択されている場合のみ表示
  return $placesEnable.value.filter(place => place.id == props.places[0])[0];
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
  }

}
</style>