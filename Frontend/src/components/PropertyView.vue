<template>
    <div id="PropertyView" :class="props.deviceMode">
        <div id="closeSlider" :class="props.deviceMode" @click="PropertyCtrl.wrapEvent('click', $event)"
            @mousemove="PropertyCtrl.wrapEvent('mousemove', $event)"
            @mousedown="PropertyCtrl.wrapEvent('mousedown', $event)"
            @mouseup="PropertyCtrl.wrapEvent('mouseup', $event)"
            @touchmove="PropertyCtrl.wrapEvent('touchmove', $event)"
            @touchstart="PropertyCtrl.wrapEvent('touchstart', $event)"
            @touchend="PropertyCtrl.wrapEvent('touchend', $event)"
            @touchcancel="PropertyCtrl.wrapEvent('touchcancel', $event)">
        </div>
        <p id="name">{{ PlaceInfo[props.PlaceId].name }}
            <span @click="shareLink()" id="linkShare">
                <font-awesome-icon :icon="['fas', 'share-from-square']" />共有
            </span>
        </p>
        <p>
            <span v-if="FloorInfo[props.Floor].fullName != null">
                <font-awesome-icon :icon="['fas', 'location-dot']" /> {{ FloorInfo[props.Floor].fullName }}
            </span>
        </p>
        <p>{{ PlaceInfo[props.PlaceId].desc }}</p>
        <div id="imageObjects" v-if="PlaceInfo[props.PlaceId].images != (null || '')">
        </div>
    </div>

</template>
<script setup>
import { onMounted, ref, watch } from 'vue'
import PlaceInfo from '@/assets/PlaceInfo.json'
import FloorInfo from '@/assets/FloorInfo.json'

// 入出力
const props = defineProps(["Floor", "PlaceId", "deviceMode"])
const emit = defineEmits(["hideProperty"])
const BASE_URL = import.meta.env.BASE_URL
// ウィンドウサイズ
const windowWidth = window.innerWidth
const windowHeight = window.innerHeight - Number(getComputedStyle(document.querySelector(":root")).getPropertyValue("--HeaderHeight").slice(0, -2))// CSSのヘッダー分を引く（CSS変数と同期）

// プロパティビュー
const PropertySize = ref(0)
let PropertyCtrl = new class {
    #PropertySizeMiddleRate
    #PropertySizeMaxRate
    constructor() {
        if (props.deviceMode == "mobile") {
            this.#PropertySizeMiddleRate = .3
            this.#PropertySizeMaxRate = .9
            PropertySize.value = windowHeight * this.#PropertySizeMiddleRate
        } else {
            this.#PropertySizeMiddleRate = .3
            this.#PropertySizeMaxRate = .8
            PropertySize.value = windowWidth * this.#PropertySizeMiddleRate
        }
    }
    #isAlreadyMoved = false //マウス使用時のみ、移動したかどうか
    wrapEvent(name, event) {
        // ラッパーに関するイベントをすべてまとめ、分岐させる
        switch (name) {
            case "click":
                if (!this.#isAlreadyMoved) {
                    this.closeProperty()
                }
                break;
            case "mousemove":
                this.#mouseMove(event);
                if (event.buttons != 0) {
                    this.#isAlreadyMoved = true
                }
                break;
            case "mousedown":
                this.#isAlreadyMoved = false
                break;
            case "mouseup":
                this.#leave(event)
                break;
            case "touchmove":
                this.#touchMove(event);
                break;
            case "touchstart":
                this.#touchStart(event);
                break;
            case "touchend":
                this.#leave(event)
                break;
            case "touchcancel":
                this.#leave(event)
                break;
            default:
                break;
        }
    }
    closeProperty() {
        emit("hideProperty")
    }
    // ドラッグ判定
    #mouseMove(event) {
        // マウスでドラッグ中の処理
        if (event.buttons == 1) {
            if (props.deviceMode == "mobile") {
                if (PropertySize.value - event.movementY > 0 && PropertySize.value - event.movementY < windowHeight)
                    PropertySize.value -= event.movementY;
            } else {
                if (PropertySize.value + event.movementX > 0 && PropertySize.value + event.movementX < windowWidth)
                    PropertySize.value += event.movementX;
            }
        }
    }
    #touchLast = 0;
    #touchStart(event) {
        // タッチでドラッグ開始時の処理
        if (event.changedTouches.length === 1) {
            if (props.deviceMode == "mobile") {
                this.#touchLast = event.changedTouches[0].clientY;
            } else {
                this.#touchLast = event.changedTouches[0].clientX;
            }
        }
    }
    #touchMove(event) {
        // タッチでドラッグ中の処理
        if (event.changedTouches.length === 1) {
            if (props.deviceMode == "mobile") {
                const Y = this.#touchLast - event.changedTouches[0].clientY
                this.#touchLast = event.changedTouches[0].clientY
                if (PropertySize.value + Y > 0 && PropertySize.value + Y < windowHeight)
                    PropertySize.value += Y;
            } else {
                const X = this.#touchLast - event.changedTouches[0].clientX
                this.#touchLast = event.changedTouches[0].clientX
                if (PropertySize.value - X > 0 && PropertySize.value - X < windowWidth)
                    PropertySize.value -= X;
            }
        }
    }
    #leave() {
        // ドラッグ終了時の処理(マウスとタッチで共通)
        if (props.deviceMode == "mobile") {
            if (PropertySize.value < windowHeight * this.#PropertySizeMiddleRate / 2) {
                // 閉じる
                this.closeProperty()
            } else if (PropertySize.value > (((windowHeight * this.#PropertySizeMiddleRate) + (windowHeight * this.#PropertySizeMaxRate)) / 2)) {
                // 最大化
                PropertySize.value = windowHeight * this.#PropertySizeMaxRate
            } else {
                PropertySize.value = windowHeight * this.#PropertySizeMiddleRate
            }
        } else {
            if (PropertySize.value < windowWidth * this.#PropertySizeMiddleRate / 2) {
                // 閉じる
                this.closeProperty()
            } else if (PropertySize.value > (((windowWidth * this.#PropertySizeMiddleRate) + (windowWidth * this.#PropertySizeMaxRate)) / 2)) {
                // 最大化
                PropertySize.value = windowWidth * this.#PropertySizeMaxRate
            } else {
                PropertySize.value = windowWidth * this.#PropertySizeMiddleRate
            }
        }
    }

}

// リンク共有
function shareLink() {
    try {
        navigator.share({ title: `西高マップ @${PlaceInfo[props.PlaceId].name}`, url: location.href })
    } catch (e) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(location.href)
            alert("リンクをコピーしました")
        } else {
            alert("リンクのコピー及び共有に対応していません")
        }
    }
}

// 画像
const imageIsReady = ref({
    image_onload: false,
    dom_onmount: false
})
const imageHeight = 300
let ImageCtrl = new class {
    #imageObjects = []
    #imagesWidth = []
    constructor() {
        // 画像の読み込み
        if (PlaceInfo[props.PlaceId].images != null) {
            for (let i = 0; i < PlaceInfo[props.PlaceId].images.length; i++) {
                this.#imageObjects[i] = new Image()
                this.#imageObjects[i].src = `${BASE_URL}img/places/${PlaceInfo[props.PlaceId].images[i]}`;
                this.#imageObjects[i].onload = () => {
                    this.#imagesWidth.push(this.#imageObjects[i].naturalWidth / this.#imageObjects[i].naturalHeight * imageHeight)
                    if (this.#imagesWidth.length == PlaceInfo[props.PlaceId].images.length) {
                        // 全ての画像の読み込みが完了したら
                        imageIsReady.value.image_onload = true
                    }
                }
            }
        }
    }
    show() {
        for (let i = 0; i < this.#imageObjects.length; i++) {
            this.#imageObjects[i].style.minWidth = `${this.#imagesWidth[i]}px`
            this.#imageObjects[i].classList.add("image")
            document.getElementById("imageObjects").appendChild(this.#imageObjects[i])
        }
    }
}
onMounted(() => {
    // DOMがマウントされたら
    imageIsReady.value.dom_onmount = true
})
watch(imageIsReady, (newVal) => {
    // 画像の読み込みが完了したら画像を表示
    if (newVal.image_onload && newVal.dom_onmount) {
        ImageCtrl.show()
    }
}, {
    immediate: true,
    deep: true
})
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
    bottom: v-bind(PropertySize + "px");
    transform: translate(-50%, 100%);
}

#closeSlider.pc {
    width: 30px;
    height: 200px;
    left: v-bind(PropertySize + "px");
    top: calc(calc(v-bind(windowHeight + "px") / 2) + var(--HeaderHeight));
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
    height: v-bind(PropertySize + "px");
    bottom: 0;
    border-radius: 20px 20px 0 0;
    padding: 35px 20px 20px 20px;

}

#PropertyView.pc {
    width: v-bind(PropertySize + "px");
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

#linkShare {
    cursor: pointer;
    margin-left: 10px;
    font-size: 1rem;
}

#imageObjects {
    display: flex;
    overflow: scroll;
    height: v-bind(imageHeight + "px");
    margin: 10px;
}
</style>
<style>
#imageObjects img {
    height: 100%;
    border-radius: 20px;
    margin: 0 10px;
    border: 2px solid var(--SubColor);
    box-sizing: border-box;
}
</style>