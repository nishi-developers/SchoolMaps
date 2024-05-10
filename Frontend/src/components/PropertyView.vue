<template>
    <div id="PropertyView" v-if="isShowPropertyView" @mousemove="mouseMove($event)" @mouseup="leave($event)"
        @touchstart="touchStart($event)" @touchmove="touchMove($event)" @touchend="leave($event)">
        <div id="closeSlider"></div>
        name : {{ PlaceInfo[props.Floor][props.PlaceId].name }}<br>
        description : {{ PlaceInfo[props.Floor][props.PlaceId].desc }}<br>
    </div>

</template>
<script setup>
import { ref } from 'vue'
import PlaceInfo from '@/assets/PlaceInfo.json'

const isShowPropertyView = ref(true)
const props = defineProps(["Floor", "PlaceId"])
const emit = defineEmits(["hideProperty"])



const window_height = window.innerHeight - Number(getComputedStyle(document.querySelector(":root")).getPropertyValue("--header-height").slice(0, -2))// CSSのヘッダー分を引く（CSS変数と同期）
const InfoHeightRate = 3
const InfoHeight = ref(window_height / InfoHeightRate)

function closePropertyView() {
    emit("hideProperty")
}
function mouseMove(event) {
    if (event.buttons == 1) {
        if (InfoHeight.value - event.movementY > 0 && InfoHeight.value - event.movementY < window_height)
            InfoHeight.value -= event.movementY;
    }
}
let touchLastY = 0;
function touchStart(event) {
    if (event.changedTouches.length === 1) {
        touchLastY = event.changedTouches[0].clientY;
    }
}
function touchMove(event) {
    if (event.changedTouches.length === 1) {
        const Y = touchLastY - event.changedTouches[0].clientY
        touchLastY = event.changedTouches[0].clientY
        if (InfoHeight.value + Y > 0 && InfoHeight.value + Y < window_height)
            InfoHeight.value += Y;
    }

}
function leave() {
    if (InfoHeight.value < window_height / InfoHeightRate / 2) {
        closePropertyView()
    } else if (InfoHeight.value > ((window_height - (window_height / InfoHeightRate)) / 2) + (window_height / InfoHeightRate)) {
        InfoHeight.value = window_height
    } else {
        InfoHeight.value = window_height / InfoHeightRate
    }
}
</script>
<style scoped>
#closeSlider {
    width: 100px;
    height: 20px;
    border-radius: 10px;
    background-color: rgb(138, 138, 138);
    position: absolute;
    left: 50%;
    top: 0;
    transform: translate(-50%, 0);

}

#PropertyView {
    background-color: #e2e2e2;
    width: 100%;
    height: v-bind(InfoHeight + "px");
    position: absolute;
    bottom: 0;
    z-index: 10;
    border-radius: 20px 20px 0 0;
    padding: 20px;
    box-sizing: border-box;
}
</style>