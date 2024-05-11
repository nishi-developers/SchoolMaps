<template>
    <div id="PropertyView" :class="deviceMode" v-if="isShowPropertyView">
        <div id="closeSlider" :class="deviceMode" @mousedown="click_Detect()"
            @mousemove="mouseMove($event); click_notDetect()" @mouseup="leave($event)"
            @touchstart="touchStart($event); click_Detect()" @touchmove="touchMove($event); click_notDetect()"
            @touchend="leave($event)" @touchcancel="leave($event)" @click="click_toClose()" @dblclick="dubleClick()">
        </div>
        name : {{ PlaceInfo[props.Floor][props.PlaceId].name }}<br>
        description : {{ PlaceInfo[props.Floor][props.PlaceId].desc }}
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
let InfoSizeMiddleRate = 0
let InfoSizeMaxRate = 0
if (window_width < window_height) {
    deviceMode.value = "mobile"
    InfoSizeMiddleRate = .3
    InfoSizeMaxRate = .9
    InfoSize.value = window_height * InfoSizeMiddleRate
} else {
    deviceMode.value = "pc"
    InfoSizeMiddleRate = .3
    InfoSizeMaxRate = .8
    InfoSize.value = window_width * InfoSizeMiddleRate
}

let isClick = false
let isDubleClick = false
function click_toClose() {
    // ダブルクリックと判定されるまでの時間を遅らせる
    if (isClick) {
        isClick = false
        isDubleClick = false
        setTimeout(() => {
            if (!isDubleClick) {
                closePropertyView()
            }
        }, 200)
    }
}
function click_Detect() {
    // クリック開始が検出されたときにフラグを立てる
    isClick = true
}
function click_notDetect() {
    // クリックではなくドラックだとわかったときにフラグを解除する
    isClick = false
}

function dubleClick() {
    isDubleClick = true
    // 最大であれば中へ、中であれば最大へ
    if (deviceMode.value == "mobile") {
        if (InfoSize.value == window_height * InfoSizeMiddleRate) {
            InfoSize.value = window_height * InfoSizeMaxRate
        } else {
            InfoSize.value = window_height * InfoSizeMiddleRate
        }
    } else {
        if (InfoSize.value == window_width * InfoSizeMiddleRate) {
            InfoSize.value = window_width * InfoSizeMaxRate
        } else {
            InfoSize.value = window_width * InfoSizeMiddleRate
        }
    }
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
        if (InfoSize.value < window_height * InfoSizeMiddleRate / 2) {
            // 閉じる
            closePropertyView()
        } else if (InfoSize.value > (((window_height * InfoSizeMiddleRate) + (window_height * InfoSizeMaxRate)) / 2)) {
            // 最大化
            InfoSize.value = window_height * InfoSizeMaxRate
        } else {
            InfoSize.value = window_height * InfoSizeMiddleRate
        }
    } else {
        if (InfoSize.value < window_width * InfoSizeMiddleRate / 2) {
            // 閉じる
            closePropertyView()
        } else if (InfoSize.value > (((window_width * InfoSizeMiddleRate) + (window_width * InfoSizeMaxRate)) / 2)) {
            // 最大化
            InfoSize.value = window_width * InfoSizeMaxRate
        } else {
            InfoSize.value = window_width * InfoSizeMiddleRate
        }
    }
}
</script>
<style scoped>
#closeSlider {
    border-radius: 15px;
    position: fixed;
    background-color: rgb(138, 138, 138);
    cursor: pointer;
}

#closeSlider:active {
    background-color: rgb(100, 100, 100);
}

#closeSlider.mobile {
    width: 100px;
    height: 30px;
    left: 50%;
    bottom: v-bind(InfoSize + "px");
    transform: translate(-50%, 100%);
}

#closeSlider.pc {
    width: 30px;
    height: 100px;
    left: v-bind(InfoSize + "px");
    top: calc(calc(v-bind(window_height + "px") / 2) + var(--header-height));
    transform: translate(-100%, -50%);
}

#PropertyView {
    background-color: #e2e2e2;
    position: absolute;
    z-index: 20;
    box-sizing: border-box;
    padding: 20px;
    overflow: scroll;
}

#PropertyView.mobile {
    width: 100%;
    height: v-bind(InfoSize + "px");
    bottom: 0;
    border-radius: 20px 20px 0 0;
}

#PropertyView.pc {
    width: v-bind(InfoSize + "px");
    height: calc(100% - var(--header-height));
    bottom: 0;
    border-radius: 0 20px 20px 0;
}
</style>