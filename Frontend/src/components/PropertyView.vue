<template>
    <div id="PropertyView" :class="deviceMode">
        <div id="closeSlider" :class="deviceMode" @click="Control.wrapEvent('click', $event)"
            @mousemove="Control.wrapEvent('mousemove', $event)" @mousedown="Control.wrapEvent('mousedown', $event)"
            @mouseup="Control.wrapEvent('mouseup', $event)" @touchmove="Control.wrapEvent('touchmove', $event)"
            @touchstart="Control.wrapEvent('touchstart', $event)" @touchend="Control.wrapEvent('touchend', $event)"
            @touchcancel="Control.wrapEvent('touchcancel', $event)">
        </div>
        <p id="name">{{ PlaceInfo[props.Floor][props.PlaceId].name }}
            <font-awesome-icon v-if="!isCopy" id="linkCopy" @click="copyLink()" :icon="['fas', 'link']" />
            <font-awesome-icon v-else id="linkCopy" @click="copyLink()" :icon="['fas', 'check']" />
            <span v-if="isCopy" id="linkCopied">リンクをコピーしました</span>
        </p>
        <p>
            <span v-if="PlaceInfo[props.Floor].__FloorFullName__ != null">
                <font-awesome-icon :icon="['fas', 'stairs']" /> {{ PlaceInfo[props.Floor].__FloorFullName__ }}
            </span>
            <span v-if="PlaceInfo[props.Floor][props.PlaceId].place != null">
                <font-awesome-icon id="locationIcon" :icon="['fas', 'location-dot']" /> {{
                    PlaceInfo[props.Floor][props.PlaceId].place }}
            </span>
        </p>
        <p v-html="PlaceInfo[props.Floor][props.PlaceId].desc"> </p>
        <div id="imageObjects" v-if="PlaceInfo[props.Floor][props.PlaceId].images != null">
            <img v-for="img, key in images" :key="key" :style="{ 'min-width': `${img.width}px` }" :src="img.path"
                alt="画像">
        </div>
    </div>

</template>
<script setup>
import { ref } from 'vue'
import PlaceInfo from '@/assets/PlaceInfo.json'

// 入出力
const props = defineProps(["Floor", "PlaceId", "deviceMode"])
const emit = defineEmits(["hideProperty"])
const BASE_URL = import.meta.env.BASE_URL

let Control = new class {
    #isAlreadyMoved = false //マウス使用時のみ、移動したかどうか
    wrapEvent(name, event) {
        // ラッパーに関するイベントをすべてまとめ、分岐させる
        switch (name) {
            case "click":
                if (!this.#isAlreadyMoved) {
                    closePropertyView()
                }
                break;
            case "mousemove":
                mouseMove(event);
                if (event.buttons != 0) {
                    this.#isAlreadyMoved = true
                }
                break;
            case "mousedown":
                this.#isAlreadyMoved = false
                break;
            case "mouseup":
                leave(event)
                break;
            case "touchmove":
                touchMove(event);
                break;
            case "touchstart":
                touchStart(event);
                break;
            case "touchend":
                leave(event)
                break;
            case "touchcancel":
                leave(event)
                break;
            default:
                break;
        }
    }
}



// pc or mobile (deviceMode)
const deviceMode = ref(props.deviceMode)
const window_width = window.innerWidth
const window_height = window.innerHeight - Number(getComputedStyle(document.querySelector(":root")).getPropertyValue("--HeaderHeight").slice(0, -2))// CSSのヘッダー分を引く（CSS変数と同期）
const InfoSize = ref(0)
let InfoSizeMiddleRate = 0
let InfoSizeMaxRate = 0
if (deviceMode.value == "mobile") {
    InfoSizeMiddleRate = .3
    InfoSizeMaxRate = .9
    InfoSize.value = window_height * InfoSizeMiddleRate
} else {
    InfoSizeMiddleRate = .3
    InfoSizeMaxRate = .8
    InfoSize.value = window_width * InfoSizeMiddleRate
}

function closePropertyView() {
    emit("hideProperty")
}

// ドラッグ判定
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

// リンクコピー
const isCopy = ref(false)
function copyLink() {
    const url = `${location.protocol}//${location.host}${BASE_URL}${props.Floor}/${props.PlaceId}`
    navigator.clipboard.writeText(url)
    isCopy.value = true
    setTimeout(() => {
        isCopy.value = false
    }, 2000)
}

const imageHeight = 300 // 画像の高さ
let imageObjects = Array
const images = ref([])
// 画像の比率を取得してimagesに格納
if (PlaceInfo[props.Floor][props.PlaceId].images != null) {
    for (let i = 0; i < PlaceInfo[props.Floor][props.PlaceId].images.length; i++) {
        imageObjects[i] = new Image()
        imageObjects[i].src = `${BASE_URL}/img/places/${PlaceInfo[props.Floor][props.PlaceId].images[i]}`;
        imageObjects[i].onload = () => {
            images.value.splice(i, 0, {
                "path": `${BASE_URL}/img/places/${PlaceInfo[props.Floor][props.PlaceId].images[i]}`,
                "width": imageObjects[i].naturalWidth / imageObjects[i].naturalHeight * imageHeight,
            });
        }
    }
}
</script>
<style scoped>
#closeSlider {
    border-radius: 15px;
    position: fixed;
    background-color: var(--MainColor);
    cursor: pointer;
}

#closeSlider:active {
    background-color: var(--SubColor);
}

#closeSlider.mobile {
    width: 200px;
    height: 30px;
    left: 50%;
    bottom: v-bind(InfoSize + "px");
    transform: translate(-50%, 100%);
}

#closeSlider.pc {
    width: 30px;
    height: 200px;
    left: v-bind(InfoSize + "px");
    top: calc(calc(v-bind(window_height + "px") / 2) + var(--HeaderHeight));
    transform: translate(-100%, -50%);
}

#PropertyView {
    background-color: var(--SubBaseColor);
    position: absolute;
    z-index: 20;
    box-sizing: border-box;
    overflow: scroll;
}

#PropertyView.mobile {
    width: 100%;
    height: v-bind(InfoSize + "px");
    bottom: 0;
    border-radius: 20px 20px 0 0;
    padding: 35px 20px 20px 20px;

}

#PropertyView.pc {
    width: v-bind(InfoSize + "px");
    height: calc(100% - var(--HeaderHeight));
    bottom: 0;
    border-radius: 0 20px 20px 0;
    padding: 20px 35px 20px 20px;
}

p {
    color: var(--MainBodyColor);
    font-size: 1.2rem;
}

#name {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 10px;
}

#linkCopy {
    cursor: pointer;
    margin-left: 10px;
    font-size: 1.2rem;
}

#linkCopied {
    font-size: 0.8rem;
    margin-left: 5px;
}

#locationIcon {
    margin-left: 15px;
}

#imageObjects {
    display: flex;
    overflow: scroll;
    height: v-bind(imageHeight + "px");
    margin: 10px;
}

#imageObjects img {
    height: 100%;
    border-radius: 20px;
    margin: 0 10px;
    border: 2px solid var(--SubColor);
    box-sizing: border-box;
}
</style>