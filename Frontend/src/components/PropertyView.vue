<template>
    <div id="PropertyView" :class="deviceMode" v-if="isShowPropertyView" @mousemove="mouseMove($event)"
        @mouseup="leave($event)" @touchstart="touchStart($event)" @touchmove="touchMove($event)"
        @touchend="leave($event)">
        <div id="closeSlider" :class="deviceMode"></div>
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

// pc or mobile (deviceMode)
const deviceMode = ref()
const window_width = window.innerWidth
const window_height = window.innerHeight - Number(getComputedStyle(document.querySelector(":root")).getPropertyValue("--header-height").slice(0, -2))// CSSのヘッダー分を引く（CSS変数と同期）
const InfoSize = ref(0)
let InfoSizeRate = 0
if (window_width < window_height) {
    deviceMode.value = "mobile"
    InfoSizeRate = 3
    InfoSize.value = window_height / InfoSizeRate
} else {
    deviceMode.value = "pc"
    InfoSizeRate = 3
    InfoSize.value = window_width / InfoSizeRate

}

function closePropertyView() {
    emit("hideProperty")
}
function mouseMove(event) {
    if (event.buttons == 1) {
        if (deviceMode.value == "mobile") {
            if (InfoSize.value - event.movementY > 0 && InfoSize.value - event.movementY < window_height)
                InfoSize.value -= event.movementY;
        } else {
            if (InfoSize.value + event.movementX > 0 && InfoSize.value + event.movementX < window_width)
                InfoSize.value += event.movementX;
        }
    }
}
let touchLast = 0;
function touchStart(event) {
    if (event.changedTouches.length === 1) {
        if (deviceMode.value == "mobile") {
            touchLast = event.changedTouches[0].clientY;
        } else {
            touchLast = event.changedTouches[0].clientX;
        }
    }
}
function touchMove(event) {
    if (event.changedTouches.length === 1) {
        if (deviceMode.value == "mobile") {
            const Y = touchLast - event.changedTouches[0].clientY
            touchLast = event.changedTouches[0].clientY
            if (InfoSize.value + Y > 0 && InfoSize.value + Y < window_height)
                InfoSize.value += Y;
        } else {
            const X = touchLast - event.changedTouches[0].clientX
            touchLast = event.changedTouches[0].clientX
            if (InfoSize.value - X > 0 && InfoSize.value - X < window_width)
                InfoSize.value -= X;
        }
    }

}
function leave() {
    if (deviceMode.value == "mobile") {
        if (InfoSize.value < window_height / InfoSizeRate / 2) {
            closePropertyView()
        } else if (InfoSize.value > ((window_height - (window_height / InfoSizeRate)) / 2) + (window_height / InfoSizeRate)) {
            InfoSize.value = window_height
        } else {
            InfoSize.value = window_height / InfoSizeRate
        }
    } else {
        if (InfoSize.value < window_width / InfoSizeRate / 2) {
            closePropertyView()
        } else if (InfoSize.value > ((window_width - (window_width / InfoSizeRate)) / 2) + (window_width / InfoSizeRate)) {
            InfoSize.value = window_width
        } else {
            InfoSize.value = window_width / InfoSizeRate
        }

    }
}
</script>
<style scoped>
#closeSlider {
    border-radius: 10px;
    position: absolute;
    background-color: rgb(138, 138, 138);
}

#closeSlider.mobile {
    width: 100px;
    height: 20px;
    position: absolute;
    left: 50%;
    top: 0;
    transform: translate(-50%, 0);
}

#closeSlider.pc {
    width: 20px;
    height: 100px;
    right: 0;
    top: 50%;
    transform: translate(0, -50%);
}

#PropertyView {
    background-color: #e2e2e2;
    position: absolute;
    z-index: 10;
    box-sizing: border-box;
    padding: 20px;

}

#PropertyView.mobile {
    width: 100%;
    height: v-bind(InfoSize + "px");
    bottom: 0;
    border-radius: 20px 20px 0 0;
}

#PropertyView.pc {
    width: v-bind(InfoSize + "px");
    height: 100%;
    bottom: 0;
    border-radius: 0 20px 20px 0;
}
</style>