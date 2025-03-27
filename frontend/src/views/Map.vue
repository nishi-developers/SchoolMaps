<script setup>
import { onMounted, ref, defineAsyncComponent, watch } from 'vue'
import PropertyView from '@/components/PropertyView.vue';
import PlaceInfo from '@/assets/PlaceInfo.json'
import FloorInfo from '@/assets/FloorInfo.json'
import { event } from 'vue-gtag'
import router from '@/router';
import { onBeforeRouteLeave } from 'vue-router';

// ref
const currentPlaceId = ref("")
const currentFloor = ref()
const mapDefaultWidth = ref(0)
const deviceMode = ref("")
const labelOpacity = ref(1)

// hook
onMounted(() => {
    Setup.resolveUrl()
    Control.resetMove() // 処理内容的にURL解決が先
})
const popstateEvent = () => {
    Setup.resolveUrl()
}
window.addEventListener('popstate', popstateEvent);
onBeforeRouteLeave((to, from, next) => {
    // 解除をしないと、他のページで誤作動する
    window.removeEventListener('popstate', popstateEvent);
    next()
})
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
            FloorInfo[currentFloor.value].layer.forEach((layer) => {
                if (layer.prefix == element.id.split("-")[0]) {
                    element.classList.add(layer.prefix)
                    if (layer.touchable) { // touchable=ラベルあり
                        // "-"以下はid重複防止用なので削除 -> "-"以下をplaceidとして取得
                        element.setAttribute("placeid", element.id.split("-")[1])
                        // ラベルをSVGに追加
                        let pathElement = element.getBBox();
                        let centerX = pathElement.x + pathElement.width / 2;
                        let centerY = pathElement.y + pathElement.height / 2;
                        // mapSvg.insertAdjacentHTML('beforeend', `<circle cx="${centerX}" cy="${centerY}" r="5" fill="red" />`);
                        mapSvg.insertAdjacentHTML('beforeend', `<text x="${centerX}" y="${centerY}" class="label added">${PlaceInfo[element.getAttribute("placeid")].name}<text/>`);
                    }
                }
            })
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
        // history.stateは必須(VueRouterの仕様)
        if (id != null) {
            history.pushState(history.state, '', `${import.meta.env.BASE_URL}${floor}/${id}`);
        }
        else {
            history.pushState(history.state, '', `${import.meta.env.BASE_URL}${floor}`);
        }
        Setup.resolveUrl() // PropertyViewからの呼び出しのため、thisを使わない
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
                this.#changeFloor(Number(floor))
            } else {
                this.#changeFloor(0)
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
    #changeFloor(floor) {
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
        },
        get headerHeight() {
            return Number(getComputedStyle(document.querySelector(":root")).getPropertyValue("--HeaderHeight").slice(0, -2))
        }
    }
    mapSize = {
        get width() {
            return FloorInfo[Number(currentFloor.value)].mapWidth;
        },
        get height() {
            return FloorInfo[Number(currentFloor.value)].mapHeight;
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
        document.querySelectorAll(`.main.selected`).forEach((element) => {
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
        return Object.keys(PlaceInfo).includes(id)
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
    isReset: false
})
const oldMapStatus = ref({
    position: {
        left: 0,
        top: 0,
    },
    zoom: 0,
    rotate: 0,
    isReset: false
})
const mapStatusZoomLimit = {
    min: 0.5,
    max: 10,
}
watch(mapStatus, () => {
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
    // 中心点の移動
    // zoom
    if (!mapStatus.value.isReset) {
        if (mapStatus.value.zoom !== oldMapStatus.value.zoom) {
            // y軸の移動
            let oldRealHeight = (Math.abs(defaultWidth * Math.sin(radian)) + Math.abs(defaultHeight * Math.cos(radian))) * oldMapStatus.value.zoom
            let mapTop = mapStatus.value.position.top - realHeight / 2
            let oldMapTop = oldMapStatus.value.position.top - oldRealHeight / 2
            let mapTopDiff = mapTop - oldMapTop
            let mapTopDiffFromCenter = mapTopDiff * (((MapMove.moveCenter.y - oldMapStatus.value.position.top)) / (realHeight / 2))
            mapStatus.value.position.top += mapTopDiffFromCenter
            // x軸の移動
            let oldRealWidth = (Math.abs(defaultWidth * Math.cos(radian)) + Math.abs(defaultHeight * Math.sin(radian))) * oldMapStatus.value.zoom
            let mapLeft = mapStatus.value.position.left - realWidth / 2
            let oldMapLeft = oldMapStatus.value.position.left - oldRealWidth / 2
            let mapLeftDiff = mapLeft - oldMapLeft
            let mapLeftDiffFromCenter = mapLeftDiff * (((MapMove.moveCenter.x - oldMapStatus.value.position.left)) / (realWidth / 2))
            mapStatus.value.position.left += mapLeftDiffFromCenter
        }
    }

    // isResetのリセット
    mapStatus.value.isReset = false
    // oldMapStatusの更新
    oldMapStatus.value = JSON.parse(JSON.stringify(mapStatus.value))
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
        // 回転やズームの中心点
        this.moveCenter = {
            x: 0,
            y: 0
        }
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
        // infinityの場合は、慣性スクロールを行わない
        switch (target) {
            case "position":
                if (this.#slideData.position.speedX === Infinity || this.#slideData.position.speedY === Infinity) {
                    this.#slide_reset("position")
                    return
                }
                break;
            case "zoom":
                if (this.#slideData.zoom.speed === Infinity) {
                    this.#slide_reset("zoom")
                    return
                }
                break;
            case "rotate":
                if (this.#slideData.rotate.speed === Infinity) {
                    this.#slide_reset("rotate")
                    return
                }
                break;
        }
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
        // 表示範囲のサイズ(改)
        if (Setup.windowSize.width / Setup.mapSize.width > Setup.windowSize.height / Setup.mapSize.height) {
            // 縦幅に合わせる
            mapDefaultWidth.value = Setup.windowSize.height * (Setup.mapSize.width / Setup.mapSize.height)
        } else {
            // 横幅に合わせる
            mapDefaultWidth.value = Setup.windowSize.width
        }
        // リセット
        mapStatus.value = {
            position: {
                left: Setup.windowSize.width / 2,
                top: Setup.windowSize.height / 2,
            },
            zoom: 1,
            rotate: 0,
            isReset: true
        }
    }
}

// MapMoveByMouseClass
let MapMoveByMouse = new class {
    move(event) {
        // マウスの移動による操作
        if (event.buttons === 1) { // 左クリックが押されている場合のみ
            MapMove.move("position", event.movementX, event.movementY)
        } else if (event.buttons === 4) { // ホイールボタンが押されている場合のみ
            MapMove.moveCenter.x = window.innerWidth / 2
            MapMove.moveCenter.y = window.innerHeight / 2
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
        MapMove.moveCenter.x = event.clientX
        MapMove.moveCenter.y = event.clientY - Setup.windowSize.headerHeight
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
                MapMove.moveCenter.x = this.#positionAverage(event)[0]
                MapMove.moveCenter.y = this.#positionAverage(event)[1] - Setup.windowSize.headerHeight
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
            case "touchcancel":
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
    stroke-width: 2.0;
}

/* オブジェクト(部屋) */
/* #map_content svg .svg-object {} */

/* 選択された */
#map_content svg .main.selected {
    fill: var(--MapObjectSelectColor);

}

/* 選択されていない */
#map_content svg .main:not(.selected) {
    fill: var(--MapObjectColor);
}

/* 他の場所 */
#map_content svg .none {
    fill: var(--MapNoneColor);
}

#map_content svg .enclosure {
    fill: var(--MapEnclosureColor);
}

#map_content svg .base {
    fill: var(--MapBaseColor);
}

/* テキスト */
#map_content svg .label {
    transform-box: fill-box;
    transform-origin: 0 80%;
    transform: rotate(v-bind("- mapStatus.rotate + 'deg'")) translate(-50%, +25%);
    fill: var(--MainBodyColor);
    stroke-width: 0;
    pointer-events: none;
    font-size: 2rem;
    opacity: v-bind("labelOpacity");
}

/* webkitのみ */
/* webkitでは"transform-box"が適用されず、文字の逆回転が正常にできない */
/* そのため、ラベルの回転防止(=文字の逆回転)は無効化する */
_::-webkit-full-page-media,
_:future,
#map_content svg .label {
    transform: translate(-50%, +25%);
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
    width: 45px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

#floorMenu ul li {
    padding: 5px;
    text-align: center;
    color: var(--MainBodyColor);
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
}

#floorMenu ul li.func {
    font-size: 2rem;
}

#floorMenu ul li.floor {
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
            :key="currentFloor + '-' + currentPlaceId" @hideProperty="Setup.changeURL(currentFloor, null)"
            @jump="Setup.changeURL" />
    </Transition>
    <div id="floorMenu">
        <ul>
            <li class="func"><font-awesome-icon @click="router.push('/search')" :icon="['fas', 'magnifying-glass']" />
            </li>
            <li class="func"><font-awesome-icon @click="Control.resetMove()" :icon="['fas', 'expand']" />
            </li>
            <li class="func" v-if="labelOpacity == 0"><font-awesome-icon @click="labelOpacity = 1"
                    :icon="['fas', 'heading']" />
            </li>
            <li class="func" v-else><font-awesome-icon @click="labelOpacity = 0" :icon="['fas', 'text-slash']" />
            </li>
            <li class="floor" v-for="floor in Setup.placeInfoReverse" :key="floor.__key__"
                @click="Setup.changeURL(floor.__key__, null)"
                :class="floor.__key__ === currentFloor ? 'selected' : 'notselected'">
                {{ floor.shortName }}</li>
        </ul>
    </div>
    <div v-if="isShowWrapper" id="wrapperBox" @click="Control.wrapEvent('click', $event)"
        @mousemove="Control.wrapEvent('mousemove', $event)" @mousedown="Control.wrapEvent('mousedown', $event)"
        @mouseup="Control.wrapEvent('mouseup', $event)" @touchmove="Control.wrapEvent('touchmove', $event)"
        @touchstart="Control.wrapEvent('touchstart', $event)" @touchend="Control.wrapEvent('touchend', $event)"
        @touchcancel="Control.wrapEvent('touchcancel', $event)" @wheel="Control.wrapEvent('wheel', $event)"></div>
    <div id="box">
        <div id="map_content" draggable="false" :key="currentFloor">
            <Transition name="map" mode="out-in">
                <component :is="Setup.mapDataCurrent" @mounted="Setup.setMapData" />
            </Transition>
        </div>
    </div>
</template>