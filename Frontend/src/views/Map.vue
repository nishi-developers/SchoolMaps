<script setup>
import { onMounted, ref, defineAsyncComponent, watch } from 'vue'
import PropertyView from '@/components/PropertyView.vue';
import PlaceInfo from '@/assets/PlaceInfo.json'
import FloorInfo from '@/assets/FloorInfo.json'
import { event } from 'vue-gtag'
import { useRouter } from 'vue-router'
const router = useRouter()

// ref
const currentPlaceId = ref("")
const currentFloor = ref()
const mapDefaultWidth = ref(0)
const deviceMode = ref("")

// hook
onMounted(() => {
    Setup.resolveUrl()
    Control.resetMove() // 処理内容的にURL解決が先
})
window.addEventListener('popstate', () => {
    Setup.resolveUrl()
});
watch(currentPlaceId, () => {
    Setup.resolveMapPlaceClass()
})

// SetupClass
let Setup = new class {
    constructor() {
        this.placeInfoReverse = this.#createPlaceInfo()
        this.mapDataCurrent = null
    }
    // URL解決:いかなる場合も、変更があった場合は、URLを変更する
    setMapData() {
        // IDに基づくマップデータの加工(CSSのクラスを追加)
        // マップデータの取得
        const mapSvg = document.querySelector("#map_content svg")
        mapSvg.querySelectorAll("path").forEach((element) => {
            if (element.id.includes("none")) {
                element.classList.add("none")
            } else if (element.id.includes("base")) {
                element.classList.add("base")
            } else if (element.id.includes("label")) {
                element.classList.add("label")
            } else {
                element.classList.add("place")
                // "-"以下はid重複防止用なので削除
                element.setAttribute("placeid", element.id.split("-")[0])
            }
        })
        Setup.resolveMapPlaceClass() //thisは使えない
    }
    #createPlaceInfo() {
        // フロア情報の逆順を作成
        let result = FloorInfo.slice().reverse()
        for (let i = 0; i < result.length; i++) {
            result[i]["__key__"] = result.length - 1 - i
        }
        return result
    }
    changeURL(floor, id) {
        // URLの変更
        if (id != null) {
            history.pushState(history.state, '', `${import.meta.env.BASE_URL}${floor}/${id}`);
        }
        else {
            history.pushState(history.state, '', `${import.meta.env.BASE_URL}${floor}`);
        }
        this.resolveUrl()
    }
    resolveUrl() {
        // onMount以降に実行しなければならない
        // URLの解決
        let floor
        let id
        if (import.meta.env.BASE_URL != "/") {
            // ベースURLがある場合
            floor = location.pathname.split("/")[2]
            id = location.pathname.split("/")[3]
        } else {
            // ベースURLがない場合
            floor = location.pathname.split("/")[1]
            id = location.pathname.split("/")[2]
        }
        if (floor == null) {
            floor = ""
        }
        if (id == null) {
            id = ""
        }
        // フロアの変更
        if (floor != currentFloor.value) {
            if ((floor != "") && !isNaN(floor)
                && Number(floor) >= 0 && Number(floor) <= FloorInfo.length - 1) {
                this.changeFloor(Number(floor))
            } else {
                this.changeFloor(0)
            }
        }
        // プロパティの表示
        if (id != "") {
            if (Property.isPlaceExist(id)) {
                Property.show(id)
            } else {
                this.changeURL(currentFloor.value, null)
            }
        } else {
            Property.hide()
        }
    }
    changeFloor(floor) {
        currentFloor.value = floor
        Property.hide() //これがないと、フロアが変わったときに、プロパティが表示できずエラーになる
        this.mapDataCurrent = defineAsyncComponent(() => import(`@/assets/floors/${floor}.vue`))
    }
    windowSize = {
        get width() {
            return window.innerWidth;
        },
        get height() {
            return window.innerHeight - Number(getComputedStyle(document.querySelector(":root")).getPropertyValue("--HeaderHeight").slice(0, -2))// CSSのヘッダー分を引く（CSS変数と同期）
        }
    }
    mapSize = {
        get width() {
            return FloorInfo[Number(currentFloor.value)].__MapSizeWidth__;
        },
        get height() {
            return FloorInfo[Number(currentFloor.value)].__MapSizeHeight__;
        }
    }
    SetDeviceMode() {
        if (this.windowSize.width < this.windowSize.height) {
            deviceMode.value = "mobile"
        } else {
            deviceMode.value = "pc"
        }
    }
    resolveMapPlaceClass() {
        document.querySelectorAll(`.place.selected`).forEach((element) => {
            element.classList.remove("selected")
        })
        if (currentPlaceId.value != "") {
            document.querySelectorAll(`[placeid="${currentPlaceId.value}"]`).forEach((element) => {
                element.classList.add("selected")
            })
        }
    }
}

// PropertyClass
const isShowWrapper = ref(true)
const isShowProperty = ref(false)
let Property = new class {
    isPlaceExist(id) {
        // 存在する場所かどうかをチェック
        // resolveUrl()で確実に使用されるため、this.showではチェックしない
        return Object.keys(PlaceInfo[currentFloor.value]).includes(id)
    }
    show(id) {
        event(`open{${currentFloor.value}/${id}}`)
        if (isShowProperty.value) {
            // すでに表示されている場合は、一旦閉じてから開く
            this.hide()
            setTimeout(() => {
                isShowProperty.value = true
            }, 0);
        } else {
            // 表示されていない場合は、即時表示
            isShowProperty.value = true
        }
        currentPlaceId.value = id
    }
    showByUser(mouseEvent) {
        // idを取得
        // ラッパーを非表示にして、クリックされた場所を取得(その際に一瞬時間がかかるため、setTimeoutで遅延)
        // setTimeoutのコールバック関数内でthisを使用するとthisはグローバルオブジェクトを指すため、thisを使う代わりにクラスのプロパティを使う
        isShowWrapper.value = false
        setTimeout(() => {
            const clickedObject = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY);
            if (clickedObject.getAttribute('placeid') == null) {
                isShowWrapper.value = true
                return
            }
            const id = clickedObject.getAttribute('placeid')
            isShowWrapper.value = true
            Setup.changeURL(currentFloor.value, id)
        }, 0);
    }
    hide() {
        currentPlaceId.value = ""
        isShowProperty.value = false
    }
}

// MapMoveClass
const mapStatus = ref({
    position: {
        left: 0,
        top: 0,
    },
    zoom: 0,
    rotate: 0,
})
const mapStatusZoomLimit = {
    min: 0.5,
    max: 10,
}
watch(() => mapStatus.value, () => {
    // 範囲制限
    // position
    let radian = mapStatus.value.rotate * Math.PI / 180
    let defaultWidth = mapDefaultWidth.value
    let defaultHeight = mapDefaultWidth.value * (Setup.mapSize.height / Setup.mapSize.width)
    let realWidth = (Math.abs(defaultWidth * Math.cos(radian)) + Math.abs(defaultHeight * Math.sin(radian))) * mapStatus.value.zoom
    let realHeight = (Math.abs(defaultWidth * Math.sin(radian)) + Math.abs(defaultHeight * Math.cos(radian))) * mapStatus.value.zoom
    if (mapStatus.value.position.left > realWidth / 2 + Setup.windowSize.width) {
        mapStatus.value.position.left = realWidth / 2 + Setup.windowSize.width
    } else if (mapStatus.value.position.left < -realWidth / 2) {
        mapStatus.value.position.left = -realWidth / 2
    }
    if (mapStatus.value.position.top > realHeight / 2 + Setup.windowSize.height) {
        mapStatus.value.position.top = realHeight / 2 + Setup.windowSize.height
    } else if (mapStatus.value.position.top < -realHeight / 2) {
        mapStatus.value.position.top = -realHeight / 2
    }
    // zoom
    if (mapStatus.value.zoom < mapStatusZoomLimit.min) {
        mapStatus.value.zoom = mapStatusZoomLimit.min
    } else if (mapStatus.value.zoom > mapStatusZoomLimit.max) {
        mapStatus.value.zoom = mapStatusZoomLimit.max
    }
    // rotate
    if (mapStatus.value.rotate < -180) {
        mapStatus.value.rotate += 360
    } else if (mapStatus.value.rotate > 180) {
        mapStatus.value.rotate -= 360
    }
}, { deep: true })
let MapMove = new class {
    #slideData = {
        position: {
            speedX: 0,
            speedY: 0,
            lastMovedTime: 0,
            isDo: false,
        },
        zoom: {
            speed: 0,
            lastMovedTime: 0,
            isDo: false,
        },
        rotate: {
            speed: 0,
            lastMovedTime: 0,
            isDo: false,
        }
    }
    constructor() {
        this.#slide_reset()
    }
    #slide_reset(target = "") {
        // 慣性をリセット
        switch (target) {
            case "position":
                this.#slideData.position.speedX = 0
                this.#slideData.position.speedY = 0
                break;
            case "zoom":
                this.#slideData.zoom.speed = 0
                break;
            case "rotate":
                this.#slideData.rotate.speed = 0
                break;
            default:
                this.#slide_reset("position")
                this.#slide_reset("zoom")
                this.#slide_reset("rotate")
                this.#slideData.position.lastMovedTime = 0
                this.#slideData.zoom.lastMovedTime = 0
                this.#slideData.rotate.lastMovedTime = 0
                break;
        }
    }
    slide(target) {
        // 慣性スクロール
        // この関数を外部から呼び出すと、慣性スクロールが開始する
        if (this.#slideData[target].isDo) {
            // 重複実行防止
            return
        }
        this.#slideData[target].isDo = true
        // 設定値
        const frictionConfig = {
            position: 0.97,
            zoom: 0.97,
            rotate: 0.97,
            min: 0.001
        }
        // 速度が小さくなるまで、変更
        // 範囲内かのチェックは、省略
        if (
            (target === "position" && (Math.abs(this.#slideData.position.speedX) > frictionConfig.min || Math.abs(this.#slideData.position.speedY) > frictionConfig.min))
            || (target === "zoom" && Math.abs(this.#slideData.zoom.speed) > frictionConfig.min)
            || (target === "rotate" && Math.abs(this.#slideData.rotate.speed) > frictionConfig.min)
        ) {
            switch (target) {
                case "position":
                    mapStatus.value.position.left += this.#slideData.position.speedX
                    mapStatus.value.position.top += this.#slideData.position.speedY
                    this.#slideData.position.speedX *= frictionConfig.position
                    this.#slideData.position.speedY *= frictionConfig.position
                    break;
                case "zoom":
                    mapStatus.value.zoom += this.#slideData.zoom.speed
                    this.#slideData.zoom.speed *= frictionConfig.zoom
                    break;
                case "rotate":
                    mapStatus.value.rotate += this.#slideData.rotate.speed
                    this.#slideData.rotate.speed *= frictionConfig.rotate
                    break;
            }
            // 再帰
            setTimeout(() => {
                this.#slideData[target].isDo = false
                this.slide(target)
            }, 4)
        } else {
            this.#slideData[target].isDo = false
            this.#slide_reset(target)
        }
    }
    move(target, x, y = 0) {
        // マップのあらゆる移動を行う関数
        // 範囲内かのチェックは、省略 要修正
        // 慣性スクロールに関しては初速の計算のみを行う
        //スマホでは、0が多発するため、0の場合は無視
        if (x === 0 && y === 0) {
            return false
        }
        this.#slide_reset(target)
        switch (target) {
            case "position":
                mapStatus.value.position.left += x
                mapStatus.value.position.top += y
                // 速度を計算
                if (this.#slideData.position.lastMovedTime !== 0) {
                    this.#slideData.position.speedX = x / (Date.now() - this.#slideData.position.lastMovedTime)
                    this.#slideData.position.speedY = y / (Date.now() - this.#slideData.position.lastMovedTime)
                }
                this.#slideData.position.lastMovedTime = Date.now()
                break;
            case "zoom":
                mapStatus.value.zoom += x
                // 速度を計算
                if (this.#slideData.zoom.lastMovedTime !== 0) {
                    this.#slideData.zoom.speed = x / (Date.now() - this.#slideData.zoom.lastMovedTime)
                }
                this.#slideData.zoom.lastMovedTime = Date.now()
                break;
            case "rotate":
                mapStatus.value.rotate += x
                // 速度を計算
                if (this.#slideData.rotate.lastMovedTime !== 0) {
                    this.#slideData.rotate.speed = x / (Date.now() - this.#slideData.rotate.lastMovedTime)
                }
                this.#slideData.rotate.lastMovedTime = Date.now()
                break;
        }
        return true
    }
    reset() {
        this.#slide_reset()
        // 要修正
        // 表示範囲のサイズ(改)
        if (Setup.windowSize.width / Setup.mapSize.width > Setup.windowSize.height / Setup.mapSize.height) {
            // 縦幅に合わせる
            mapDefaultWidth.value = Setup.windowSize.height * (Setup.mapSize.width / Setup.mapSize.height)
        } else {
            // 横幅に合わせる
            mapDefaultWidth.value = Setup.windowSize.width
        }
        // リセット
        mapStatus.value.position.left = Setup.windowSize.width / 2
        mapStatus.value.position.top = Setup.windowSize.height / 2
        mapStatus.value.zoom = 1
        mapStatus.value.rotate = 0
    }
}

// MapMoveByMouseClass
let MapMoveByMouse = new class {
    move(event) {
        // マウスの移動による操作
        if (event.buttons === 1) { // 左クリックが押されている場合のみ
            MapMove.move("position", event.movementX, event.movementY)
        } else if (event.buttons === 4) { // ホイールボタンが押されている場合のみ
            if (event.movementX > 0) {
                MapMove.move("rotate", Math.sqrt(event.movementX ** 2 + event.movementY ** 2) / 5)
            } else {
                MapMove.move("rotate", -Math.sqrt(event.movementX ** 2 + event.movementY ** 2) / 5)
            }
        }
    }
    wheel(event) {
        // マウスのホイールによる操作
        let num = 0
        let unit = 0.1
        if (event.wheelDelta + unit > 0) {
            num = unit
        } else {
            num = -unit
        }
        MapMove.move("zoom", num)
        MapMove.slide("zoom")
    }
}

// MapMoveByTouchClass
let MapMoveByTouch = new class {
    #isZoomRotate = false
    #last = {
        x: 0,
        y: 0,
        fingerNum: 0,
        rotate: 0,
        length: 0
    }
    // 回転やズームの制限をするため
    // タップし始めてどれぐらい動かしたか
    #moveRestriction = {
        zoomed: 0,
        rotated: 0,
        acceptRotate: false,
    }
    #positionLength(x1, y1, x2, y2) {
        // 2点間の距離を計算する関数
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
    }
    #positionAverage(event) {
        // タッチの位置を取得する関数
        // タッチの指が複数ある場合は、それぞれの位置を取得して平均を取る
        let x = 0
        let y = 0
        for (const i of event.changedTouches) {
            x += i.clientX
            y += i.clientY
        }
        return [x / event.changedTouches.length, y / event.changedTouches.length]
    }
    start() {
        // タップし始めは、初期処理をあてるために値を変更
        this.#isZoomRotate = false
        this.#last.fingerNum = 0
        // タップし始めてどれぐらい動かしたらをリセット
        this.#moveRestriction.zoomed = 0
        this.#moveRestriction.rotated = 0
        this.#moveRestriction.acceptRotate = false
    }
    do(event) {
        // タッチの本数にかかわらず、positionモード
        // 本数が変わった場合、もしくは距離が飛んだ場合は、初期位置を変更(初期処理)
        {
            let now = {
                x: this.#positionAverage(event)[0],
                y: this.#positionAverage(event)[1]
            }
            if (this.#last.fingerNum != event.changedTouches.length || this.#positionLength(this.#last.x, this.#last.y, now.x, now.y) > 50) {
                [this.#last.x, this.#last.y] = this.#positionAverage(event) //押した位置を相対位置の基準にする
                this.#last.fingerNum = event.changedTouches.length
            }
            MapMove.move("position", now.x - this.#last.x, now.y - this.#last.y) // 位置をずらす
            this.#last.x = now.x //最終値を更新
            this.#last.y = now.y  //最終値を更新
        }
        {
            if (event.changedTouches.length === 2) { // タッチの指が2つの場合はzoomモード
                if (this.#isZoomRotate) {
                    // すでにzoomRotateモードになっている場合
                    // zoom
                    // 指の間隔を計算して、前との差からズームレベルを変更
                    let length = this.#positionLength(event.changedTouches[0].clientX, event.changedTouches[0].clientY, event.changedTouches[1].clientX, event.changedTouches[1].clientY)
                    if (MapMove.move("zoom", (length - this.#last.length) * .005)) {
                        this.#moveRestriction.zoomed += Math.abs(length - this.#last.length) //ズームした合計量を記録
                        this.#last.length = length //最終値を更新
                    }
                    // rotate
                    // 2点を結ぶ直線の傾きを計算して、前との差から回転角度を変更
                    let rotate = (Math.atan2((event.changedTouches[1].clientY - event.changedTouches[0].clientY), (event.changedTouches[1].clientX - event.changedTouches[0].clientX))) * (180 / Math.PI)
                    this.#moveRestriction.rotated += Math.abs(rotate - this.#last.rotate) //回転した合計量を記録
                    if (this.#moveRestriction.rotated > 20 && this.#moveRestriction.zoomed < 20) { //ズームをブロックする移動量(値のバランスは要調整)
                        // あまりズームせずに回転した場合は、指を離すまで回転を許可
                        this.#moveRestriction.acceptRotate = true
                    }
                    if (this.#moveRestriction.acceptRotate) {
                        if (MapMove.move("rotate", rotate - this.#last.rotate)) {
                            this.#last.rotate = rotate //最終値を更新
                        }
                    }
                } else {
                    //zoomRotateモードになっていない場合の初期処理
                    this.#isZoomRotate = true
                    this.#last.length = this.#positionLength(event.changedTouches[0].clientX, event.changedTouches[0].clientY, event.changedTouches[1].clientX, event.changedTouches[1].clientY)
                    this.#last.rotate = (Math.atan2((event.changedTouches[1].clientY - event.changedTouches[0].clientY), (event.changedTouches[1].clientX - event.changedTouches[0].clientX))) * (180 / Math.PI)
                }
            }
        }
    }
}

// ControlClass
let Control = new class {
    #isAlreadyMoved = false //マウス使用時のみ、移動したかどうか
    wrapEvent(name, event) {
        // ラッパーに関するイベントをすべてまとめ、分岐させる
        switch (name) {
            case "click":
                if (!this.#isAlreadyMoved) {
                    Property.showByUser(event)
                }
                break;
            case "mousemove":
                MapMoveByMouse.move(event)
                if (event.buttons != 0) {
                    this.#isAlreadyMoved = true
                }
                break;
            case "mousedown":
                this.#isAlreadyMoved = false
                break;
            case "mouseup":
                MapMove.slide("position")
                MapMove.slide("rotate")
                break;
            case "touchmove":
                MapMoveByTouch.do(event)
                break;
            case "touchstart":
                MapMoveByTouch.start(event)
                break;
            case "touchend":
                MapMove.slide("position")
                MapMove.slide("zoom")
                MapMove.slide("rotate")
                break;
            case "wheel":
                MapMoveByMouse.wheel(event)
                break;
            default:
                break;
        }
    }
    resetMove() {
        Setup.SetDeviceMode()
        MapMove.reset()
    }
}
</script>

<style>
/* マップのスタイル */

/* マップのルート */
#map_content svg {
    /* 要検討 */
    fill: var(--MapBaseColor);
    stroke: var(--MapBorderColor);
    stroke-width: 1;
}

/* ルート以下の子要素に対して */
#map_content svg>* {
    stroke-width: .5;
}

/* オブジェクト(部屋) */
/* #map_content svg .svg-object {} */

/* 選択された */
#map_content svg .place.selected {
    fill: var(--MapObjectSelectColor);

}

/* 選択されていない */
#map_content svg .place:not(.selected) {
    fill: var(--MapObjectColor);
}

/* 他の場所 */
#map_content svg .none {
    fill: var(--MapFloorClor);
}

#map_content svg .base {
    fill: var(--MapBaseColor);
}

/* テキスト */
#map_content svg .label {
    transform-origin: center center;
    transform-box: fill-box;
    transform: rotate(v-bind("- mapStatus.rotate + 'deg'"));
    font-size: 1rem;
    fill: var(--MainBodyColor);
    stroke-width: 0;
    pointer-events: none;
}
</style>
<style scoped>
#wrapperBox {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: fixed;
    cursor: grab;
    z-index: 2;
}

#box {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: fixed;
    background-color: var(--MainBaseColor);
    cursor: grab;
    z-index: 1;
}

#map_content svg {
    position: absolute;
    width: v-bind("(mapDefaultWidth * mapStatus.zoom) + 'px'");
    height: auto;
    left: v-bind("mapStatus.position.left + 'px'");
    top: v-bind("mapStatus.position.top + 'px'");
    transform: translate(-50%, -50%) rotate(v-bind("mapStatus.rotate + 'deg'"));

}

#box:active {
    cursor: grabbing;
}

#floorMenu {
    position: absolute;
    top: var(--HeaderHeight);
    right: 0;
    margin: 10px;
    z-index: 10;
    cursor: pointer;
}

#floorMenu ul {
    list-style: none;
}

#floorMenu ul li {
    padding: 5px;
    text-align: center;
    color: var(--MainBodyColor);
}

#floorMenu ul .func {
    font-size: 2rem;
}

#floorMenu ul .floor {
    border: 1px solid var(--MainBodyColor);
    border-radius: 20%;
    font-size: 1.5rem;
    margin: 2px 0 2px 0;
}



#floorMenu ul .selected {
    background-color: var(--SubColor);
}

#floorMenu ul .notselected {
    background-color: var(--MainBaseColor);
}

/* Transition */
#PropertyView {
    --property-transition-length: 0.2s;
}

.property-pc-enter-active,
.property-pc-leave-active {
    transition: opacity var(--property-transition-length) ease-out, transform var(--property-transition-length) ease-out;
}

.property-pc-enter-from,
.property-pc-leave-to {
    opacity: 0;
    transform: translateX(-100%);
}

.property-mobile-enter-active,
.property-mobile-leave-active {
    transition: opacity var(--property-transition-length) ease-out, transform var(--property-transition-length) ease-out;
}

.property-mobile-enter-from,
.property-mobile-leave-to {
    opacity: 0;
    transform: translateY(+100%);
}

.map-enter-active,
.map-leave-active {
    transition: opacity .2s ease;
}

.map-enter-from,
.map-leave-to {
    opacity: 0;

}
</style>
<template>
    <Transition :name="`property-${deviceMode}`">
        <PropertyView v-if="isShowProperty" :Floor="currentFloor" :PlaceId="currentPlaceId" :deviceMode="deviceMode"
            @hideProperty="Setup.changeURL(currentFloor, null)" />
    </Transition>
    <div id="floorMenu">
        <ul>
            <li class="func"><font-awesome-icon @click="router.push('/search')" :icon="['fas', 'magnifying-glass']" />
            </li>
            <li class="func"><font-awesome-icon @click="Control.resetMove()" :icon="['fas', 'expand']" />
            </li>
            <li class="floor" v-for="floor in Setup.placeInfoReverse" :key="floor.__key__"
                @click="Setup.changeURL(floor.__key__, null)"
                :class="floor.__key__ === currentFloor ? 'selected' : 'notselected'">
                {{ floor.__FloorShortName__ }}</li>
        </ul>
    </div>
    <div v-if="isShowWrapper" id="wrapperBox" @click="Control.wrapEvent('click', $event)"
        @mousemove="Control.wrapEvent('mousemove', $event)" @mousedown="Control.wrapEvent('mousedown', $event)"
        @mouseup="Control.wrapEvent('mouseup', $event)" @touchmove="Control.wrapEvent('touchmove', $event)"
        @touchstart="Control.wrapEvent('touchstart', $event)" @touchend="Control.wrapEvent('touchend', $event)"
        @wheel="Control.wrapEvent('wheel', $event)"></div>
    <div id="box">
        <div id="map_content" draggable="false" :key="currentFloor">
            <Transition name="map" mode="out-in">
                <component :is="Setup.mapDataCurrent" @mounted="Setup.setMapData" />
            </Transition>
        </div>
    </div>
</template>