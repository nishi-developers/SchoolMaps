<script setup>
import { onMounted, ref, defineAsyncComponent } from 'vue'
import PropertyView from '@/components/PropertyView.vue';
import PlaceInfo from '@/assets/PlaceInfo.json'
import { event } from 'vue-gtag'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

// マップの切り替え
let MapDataCurrent = null
function changeMapData(floor) {
    MapDataCurrent = defineAsyncComponent(() => import(`@/assets/floors/${floor}.vue`))
}

const isShowProperty = ref(false)
const point_PlaceId = ref("")
const CurrentFloor = ref()
function changeFloor(floor) {
    CurrentFloor.value = floor
    hideProperty() //これがないと、フロアが変わったときに、プロパティが表示できずエラーになる
    changeMapData(floor)
    changeURL(floor, null);
}



// フロア情報の逆順を作成
let PlaceInfoReverse = PlaceInfo.slice().reverse()
for (let i = 0; i < PlaceInfoReverse.length; i++) {
    PlaceInfoReverse[i]["__key__"] = PlaceInfoReverse.length - 1 - i
}

// URL書き換え用関数
function changeURL(floor, id) {
    if (id != null) {
        // router.replace(`${import.meta.env.BASE_URL}/${floor}/${id}`)
        // history.replaceState('', '', `${import.meta.env.BASE_URL}/${floor}/${id}`)
        history.pushState('', '', `${import.meta.env.BASE_URL}/${floor}/${id}`);
    }
    else {
        // router.replace(`${import.meta.env.BASE_URL}/${floor}`)
        // history.replaceState('', '', `${import.meta.env.BASE_URL}/${floor}`)
        history.pushState('', '', `${import.meta.env.BASE_URL}/${floor}`);
    }
}
// パラメーターの取得
if ((route.params.floor != "") && !isNaN(route.params.floor)
    && Number(route.params.floor) >= 0 && Number(route.params.floor) <= PlaceInfo.length - 1) {
    changeFloor(Number(route.params.floor))
} else {
    changeFloor(0)
}

// ドラッグなどとクリックを判別する
// <参考>
// https://qiita.com/_Keitaro_/items/375c5274bebf367f24e0
// https://qiita.com/KenjiOtsuka/items/da6d2dd2b81fef87e35d
let isClick = false
let isDubleClick = false
function showProperty(id) {
    // クリックされたときに、フラグが立っていたら
    if (isClick) {
        isClick = false
        isDubleClick = false
        // ダブルクリックと判定されるまでの時間を遅らせる
        setTimeout(() => {
            if (!isDubleClick) {
                // 存在する場所かどうかをチェック
                if (Object.keys(PlaceInfo[CurrentFloor.value]).includes(id)) {
                    console.log(id);
                    event(`open{${CurrentFloor.value}/${id}}`)
                    point_PlaceId.value = id
                    if (isShowProperty.value) {
                        // すでに表示されている場合は、一旦閉じてから開く
                        hideProperty(true)
                        setTimeout(() => {
                            isShowProperty.value = true
                        }, 50);
                    } else {
                        // 表示されていない場合は、即時表示
                        isShowProperty.value = true
                    }
                    changeURL(CurrentFloor.value, id); //hideProperty()の後に実行
                    return true //ここは瞬時なので注意
                } else {
                    return false
                }
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
function click_dubleDetect() {
    // ダブルクリックが検出されたときにフラグを立てる
    isDubleClick = true
}

function hideProperty(isChangeURL = false) {
    isShowProperty.value = false
    if (isChangeURL) {
        changeURL(CurrentFloor.value, null)
    }
}

const map_DefaultWidth = ref(0)
// deviceMode
const deviceMode = ref("")
let map_size_width = 0
let map_size_height = 0
let map_size_ratio = 0
onMounted(() => {
    resetMoving() //window_width, window_heightを使うので、ここでリセット
    // パラメーターの取得
    if (route.params.id != "") {
        isClick = true
        if (!showProperty(route.params.id)) {
            changeURL(CurrentFloor.value, null)
        }
    }

})
class mapSlideClass {
    // 慣性スクロール
    constructor() {
        this.reset()
        // 重複実行防止のフラグ
        this.is_position_do = false
        this.is_zoom_do = false
        this.is_rotate_do = false
    }
    reset() { // 慣性をリセット
        this.position_stop()
        this.zoom_stop()
        this.rotate_stop()
        this.position_lastMovedTime = 0
        this.zoom_lastMovedTime = 0
        this.rotate_lastMovedTime = 0
    }
    position_stop() { //positionのみリセット
        this.position_speedX = 0
        this.position_speedY = 0
    }
    zoom_stop() { //zoomのみリセット
        this.zoom_speed = 0
    }
    rotate_stop() { //rotateのみリセット
        this.rotate_speed = 0
    }
    position_do() {
        if (this.is_position_do === false) { // 重複実行防止
            this.is_position_do = true
            // mouse
            let position_speedMin = 0.01
            let position_frictionLevel = 0.9
            if (mouseORtouch == "touch") {
                // touch
                position_speedMin = 0.01
                position_frictionLevel = 0.95
            }
            // 速度が0になるまで、位置を変更
            if (Math.abs(this.position_speedX) > position_speedMin || Math.abs(this.position_speedY) > position_speedMin) {
                if (mapMove.map_PositionRangeCheck(this.position_speedX * 4, this.position_speedY * 4)) {
                    mapMove.map_PositionLeft.value += this.position_speedX * 4
                    mapMove.map_PositionTop.value += this.position_speedY * 4
                    this.position_speedX *= position_frictionLevel
                    this.position_speedY *= position_frictionLevel
                    // 再帰
                    setTimeout(() => { this.is_position_do = false; this.position_do(); }, 4) // 4msごとに再帰
                    // ブラウザの制限により、再帰のsetTimeoutは最小4msのタイムアウトを強制されるため、4msごとに再帰している
                } else {
                    this.is_position_do = false
                    this.position_stop()
                }
            } else {
                this.is_position_do = false
                this.position_stop()
            }
        }
    }
    zoom_do() {
        if (this.is_zoom_do === false) {
            this.is_zoom_do = true
            // mouse
            let zoom_speedMin = 0.0001
            let zoom_frictionLevel = 0.8
            if (mouseORtouch == "touch") {
                // touch
                zoom_speedMin = 0.0001
                zoom_frictionLevel = 0.8
            }
            if (Math.abs(this.zoom_speed) > zoom_speedMin && mapMove.map_ZoomLevel.value + this.zoom_speed * 4 < mapMove.map_ZoomLevelMax && mapMove.map_ZoomLevel.value + this.zoom_speed * 4 > mapMove.map_ZoomLevelMin) {
                mapMove.map_ZoomLevel.value += this.zoom_speed * 4
                this.zoom_speed *= zoom_frictionLevel
                // 再帰
                setTimeout(() => { this.is_zoom_do = false; this.zoom_do(); }, 4) // 4msごとに再帰
                // ブラウザの制限により、再帰のsetTimeoutは最小4msのタイムアウトを強制されるため、4msごとに再帰している
            } else {
                this.is_zoom_do = false
                this.zoom_stop()
            }
        }
    }
    rotate_do() {
        if (this.is_rotate_do === false) { // 重複実行防止
            this.is_rotate_do = true
            // mouse
            let rotate_speedMin = 0.01
            let rotate_frictionLevel = 0.92
            if (mouseORtouch == "touch") {
                // touch
                rotate_speedMin = 0.01
                rotate_frictionLevel = 0.95
            }
            if (Math.abs(this.rotate_speed) > rotate_speedMin) {
                mapMove.map_Rotate.value += this.rotate_speed * 4
                this.rotate_speed *= rotate_frictionLevel
                // 再帰
                setTimeout(() => { this.is_rotate_do = false; this.rotate_do(); }, 4) // 4msごとに再帰
                // ブラウザの制限により、再帰のsetTimeoutは最小4msのタイムアウトを強制されるため、4msごとに再帰している
            } else {
                this.is_rotate_do = false
                this.rotate_stop()
            }
        }
    }
}
let mapSlide = new mapSlideClass()

class mapMoveClass {
    constructor() {
        // 地図の位置
        this.map_PositionLeft = ref()
        this.map_PositionTop = ref()
        // 地図の倍率
        this.map_ZoomLevel = ref()
        this.map_ZoomLevelMax = 15
        this.map_ZoomLevelMin = 0.001
        // 地図の回転
        this.map_Rotate = ref()
    }
    map_PositionRangeCheck(x, y) {
        // 移動先が範囲内かどうかをチェックする関数
        // ズームでどうしても範囲外に出てしまうため、戻す動きは制限しない
        if (x > 0 && this.map_PositionLeft.value + x > (map_DefaultWidth.value * mapMove.map_ZoomLevel.value / 2) + window_width) {
            // 右端
            return false
        }
        else if (x < 0 && this.map_PositionLeft.value + x < -(map_DefaultWidth.value * mapMove.map_ZoomLevel.value / 2)) {
            // 左端
            return false
        }
        else if (y > 0 && this.map_PositionTop.value + y > (((map_DefaultWidth.value / map_size_ratio) * mapMove.map_ZoomLevel.value) / 2) + window_height) {
            // 下端
            return false
        }
        else if (y < 0 && this.map_PositionTop.value + y < (-(((map_DefaultWidth.value / map_size_ratio) * mapMove.map_ZoomLevel.value) / 2))) {
            // 上端
            return false
        } else {
            return true
        }
    }
    map_PositionMove(x, y) {
        mapSlide.position_stop() //慣性動作中に動かされた場合は、ここでリセットをかける
        if (this.map_PositionRangeCheck(x, y)) {
            this.map_PositionLeft.value += x
            this.map_PositionTop.value += y
            // 速度を計算
            if (mapSlide.position_lastMovedTime != 0) {
                mapSlide.position_speedX = x / (Date.now() - mapSlide.position_lastMovedTime)
                mapSlide.position_speedY = y / (Date.now() - mapSlide.position_lastMovedTime)
            }
            mapSlide.position_lastMovedTime = Date.now()
            return true //将来的に範囲を制限するかもしれないため、trueを返す
        } else {
            return false
        }
    }
    map_Zoom(v) {
        // マップのズームをする関数
        // ズームの慣性の実装は、PCとスマホで異なるため、それぞれの場所で実装
        // 範囲内であれば、ズームレベルを変更し、trueを返す
        if (v != 0) {
            if (this.map_ZoomLevel.value + v < this.map_ZoomLevelMax && this.map_ZoomLevel.value + v > this.map_ZoomLevelMin) {
                mapSlide.zoom_stop() //慣性動作中に動かされた場合は、ここでリセットをかける
                this.map_ZoomLevel.value += v
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }
    map_Rotating(v) {
        if (v != 0) { //スマホでは、回転0が多発するため、0の場合は無視
            this.map_Rotate.value += v
            mapSlide.rotate_stop() //慣性動作中に動かされた場合は、ここでリセットをかける
            if (mapSlide.rotate_lastMovedTime != 0) {
                mapSlide.rotate_speed = v / (Date.now() - mapSlide.rotate_lastMovedTime)
            }
            mapSlide.rotate_lastMovedTime = Date.now()
        }
    }
    reset() {
        // 地図のデフォルトサイズを算出
        map_size_width = PlaceInfo[CurrentFloor.value].__MapSizeWidth__
        map_size_height = PlaceInfo[CurrentFloor.value].__MapSizeHeight__
        map_size_ratio = map_size_width / map_size_height
        // 表示範囲のサイズ(改)
        window_width = window.innerWidth
        window_height = window.innerHeight - Number(getComputedStyle(document.querySelector(":root")).getPropertyValue("--HeaderHeight").slice(0, -2))// CSSのヘッダー分を引く（CSS変数と同期）
        if (window_width / map_size_width > window_height / map_size_height) {
            // 縦幅に合わせる
            map_DefaultWidth.value = window_height * map_size_ratio
        } else {
            // 横幅に合わせる
            map_DefaultWidth.value = window_width
        }
        // リセット
        this.map_PositionLeft.value = window_width / 2
        this.map_PositionTop.value = window_height / 2
        this.map_ZoomLevel.value = 1
        this.map_Rotate.value = 0
    }
}
let mapMove = new mapMoveClass()
// 慣性をのせて移動する場合は必ずここの関数を利用する
// 表示範囲のサイズ(仮)
let window_width = 0
let window_height = 0



// リセット(PC・モバイル共通)
// ダブルクリックでリセット
function resetMoving() {
    mapMove.reset()
    mapSlide.reset()
    hideProperty(true)
    if (window_width < window_height) {
        deviceMode.value = "mobile"
    } else {
        deviceMode.value = "pc"
    }
}


let mouseORtouch = ""
// PC用
// ドラッグによる移動と回転
// フラグを、クリックをし始めたときに立て、離したときに解除する
// フラグが立っている間にマウスが動けば、その分だけ移動させる
// <参考>
// https://scrapbox.io/svg-wiki/%E3%83%9E%E3%82%A6%E3%82%B9%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E3%81%8F%E3%82%8B%E3%82%84%E3%81%A4%E3%81%AE%E5%AE%9F%E8%A3%85
// https://note.com/kabineko/n/n88ec426fff07
// https://qiita.com/akicho8/items/8522929fa619394ac9f4
function mouse_moveRotate(event) {
    mouseORtouch = "mouse"
    if (event.buttons == 1) { // 左クリックが押されている場合のみ
        mapMove.map_PositionMove(event.movementX, event.movementY)
    } else if (event.buttons == 4) { // ホイールボタンが押されている場合のみ
        if (event.movementX > 0) {
            mapMove.map_Rotating(Math.sqrt(event.movementX ** 2 + event.movementY ** 2) / 5)
        } else {
            mapMove.map_Rotating(-Math.sqrt(event.movementX ** 2 + event.movementY ** 2) / 5)
        }
    }
}
// ホイールによるズーム
// ホイールを上に回すと、一定の割合でズームイン
// ホイールを下に回すと、一定の割合でズームアウト
// <参考>
// https://mebee.info/2022/03/15/post-40363/
function mouse_zoom(event) {
    mouseORtouch = "mouse"
    let num = 0
    let map_ZoomLevel_Unit = .1
    if (event.wheelDelta + map_ZoomLevel_Unit > 0) {
        num = map_ZoomLevel_Unit
    } else {
        num = -map_ZoomLevel_Unit
    }
    if (mapMove.map_Zoom(num)) {
        mapSlide.zoom_speed = num / 5
        mapSlide.zoom_do()
    }
}

// モバイル用
// タッチによる操作(移動とズーム共通)
// <参考>
// https://qiita.com/shigeta1019/items/23a78e5d00d641b0384c
// https://qiita.com/tonio0720/items/6facacac5db6d68f1a13
// lastがついてる変数は、直前の値を保存するため
let touch_mode = ""
// move: 移動(何本の指でも)
// zoom: 2つの指でズーム・回転
// moveモード用の変数
let touch_last_x = 0
let touch_last_y = 0
let touch_temp_x = 0
let touch_temp_y = 0
let touch_last_finger = 0
// zoomモード用の変数
let touch_last_diff = 0
let touch_diff = 0
let touch_last_rotate = 0
let touch_rotate = 0
// タップし始めてどれぐらい動かしたら
let touch_zoomed = 0
let touch_rotated = 0
let touch_acceptRotate = false
// タッチの位置を取得する関数
// タッチの指が複数ある場合は、それぞれの位置を取得して平均を取る
function touch_positionAverage(event) {
    let x = 0
    let y = 0
    for (const i of event.changedTouches) {
        x += i.clientX
        y += i.clientY
    }
    return [
        x / event.changedTouches.length,
        y / event.changedTouches.length
    ]
}
function touch(event, status) {
    mouseORtouch = "touch"
    if (status === 'start') {
        // タップし始めは、初期処理をあてるために値を変更
        touch_mode = "none"
        touch_last_finger = 0
        // タップし始めてどれぐらい動かしたらをリセット
        touch_zoomed = 0
        touch_rotated = 0
        touch_acceptRotate = false
    } else if (status === 'doing') { // 指を動かしたときは、それぞれの処理を行う
        // タッチの本数にかかわらず、moveモード
        // 本数が変わった場合は、初期位置を変更(初期処理)
        if (touch_last_finger != event.changedTouches.length) {
            [touch_last_x, touch_last_y] = touch_positionAverage(event) //押した位置を相対位置の基準にする
            touch_last_finger = event.changedTouches.length
        }
        [touch_temp_x, touch_temp_y] = touch_positionAverage(event)
        mapMove.map_PositionMove(touch_temp_x - touch_last_x, touch_temp_y - touch_last_y) // 位置をずらす
        touch_last_x = touch_temp_x //最終値を更新
        touch_last_y = touch_temp_y //最終値を更新

        if (event.changedTouches.length === 2) { // タッチの指が2つの場合はzoomモード
            if (touch_mode == "zoom") {
                // すでにzoomモードになっている場合
                // 指の間隔を計算して、前との差からズームレベルを変更
                touch_diff = Math.sqrt((event.changedTouches[0].clientX - event.changedTouches[1].clientX) ** 2 + (event.changedTouches[0].clientY - event.changedTouches[1].clientY) ** 2)
                if (mapMove.map_Zoom((touch_diff - touch_last_diff) * .005)) {
                    // 慣性の実装
                    if (mapSlide.zoom_lastMovedTime != 0) {
                        mapSlide.zoom_speed = (touch_diff - touch_last_diff) * .005 / (Date.now() - mapSlide.zoom_lastMovedTime)
                    }
                    mapSlide.zoom_lastMovedTime = Date.now()
                    touch_zoomed += Math.abs(touch_diff - touch_last_diff) //ズームした合計量を記録
                    touch_last_diff = touch_diff //最終値を更新
                }
                // 2点を結ぶ直線の傾きを計算して、前との差から回転角度を変更
                touch_rotate = (Math.atan2((event.changedTouches[1].clientY - event.changedTouches[0].clientY), (event.changedTouches[1].clientX - event.changedTouches[0].clientX))) * (180 / Math.PI)
                touch_rotated += Math.abs(touch_rotate - touch_last_rotate) //回転した合計量を記録
                if (touch_rotated > 10 && touch_zoomed < 40) { //ズームをブロックする移動量(要調整)
                    // あまりズームせずに回転した場合は、指を離すまで回転を許可
                    touch_acceptRotate = true
                }
                if (touch_acceptRotate) {
                    mapMove.map_Rotating(touch_rotate - touch_last_rotate)
                }
                touch_last_rotate = touch_rotate //最終値を更新
            } else {
                //zoomモードになっていない場合の初期処理
                touch_mode = "zoom"
                touch_last_diff = Math.sqrt((event.changedTouches[0].clientX - event.changedTouches[1].clientX) ** 2 + (event.changedTouches[0].clientY - event.changedTouches[1].clientY) ** 2)
                touch_last_rotate = (Math.atan2((event.changedTouches[1].clientY - event.changedTouches[0].clientY), (event.changedTouches[1].clientX - event.changedTouches[0].clientX))) * (180 / Math.PI)
            }
        }
    }
}
function moveSertch() {
    router.push('/search')
}

// デフォルトのピンチアウトを無効化
// 1本をブロックすると、プロパティでのスクロールが無効化されるため、2本以上をブロックする
// <参考>
// https://moewe-net.com/js/disable-zoom
document.body.addEventListener('touchmove', (event) => {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, { passive: false });

</script>


<style scoped>
#box {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: fixed;
    background-color: var(--MainBaseColor);
    cursor: grab;
}

#map_content svg {
    position: absolute;
    /* background-color: #f0f0f0; */
    width: v-bind("(map_DefaultWidth * mapMove.map_ZoomLevel.value) + 'px'");
    height: auto;
    left: v-bind("mapMove.map_PositionLeft.value + 'px'");
    top: v-bind("mapMove.map_PositionTop.value + 'px'");
    /* 中心を基準にするためtranslate(-50%, -50%) */
    transform: translate(-50%, -50%) rotate(v-bind("mapMove.map_Rotate.value + 'deg'"));

}

#box:active {
    cursor: grabbing;
}

.svg-text {
    transform-origin: center center;
    transform-box: fill-box;
    transform: rotate(v-bind("- mapMove.map_Rotate.value + 'deg'"));
    color: var(--MainBodyColor);
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

#floorMenu ul .search {
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
.property-pc-enter-active,
.property-pc-leave-active {
    transition: opacity .25s ease-out, transform .25s ease-out;
}

.property-pc-enter-from,
.property-pc-leave-to {
    opacity: 0;
    transform: translateX(-100%);
}

.property-mobile-enter-active,
.property-mobile-leave-active {
    transition: opacity .25s ease-out, transform .25s ease-out;
}

.property-mobile-enter-from,
.property-mobile-leave-to {
    opacity: 0;
    transform: translateY(+100%);
}

.map-enter-active,
.map-leave-active {
    transition: opacity .25s ease;
}

.map-enter-from,
.map-leave-to {
    opacity: 0;

}
</style>
<template>
    <Transition :name="`property-${deviceMode}`">
        <PropertyView v-if="isShowProperty" :Floor="CurrentFloor" :PlaceId="point_PlaceId" :deviceMode="deviceMode"
            @hideProperty="hideProperty(true)" />
    </Transition>
    <div id="floorMenu">
        <ul>
            <li class="search"><font-awesome-icon @click="moveSertch()" :icon="['fas', 'magnifying-glass']" />
            </li>
            <li class="floor" v-for="floor in PlaceInfoReverse" :key="floor.__key__" @click="changeFloor(floor.__key__)"
                :class="floor.__key__ == CurrentFloor ? 'selected' : 'notselected'">
                {{ floor.__FloorName__ }}</li>
        </ul>
    </div>
    <div id="box" @dblclick="resetMoving(); click_dubleDetect()"
        @mousemove="mouse_moveRotate($event); click_notDetect()" @mousedown="click_Detect()"
        @mouseup="mapSlide.position_do(); mapSlide.rotate_do()" @touchmove="touch($event, 'doing'); click_notDetect();"
        @touchstart="touch($event, 'start'); click_Detect()"
        @touchend="mapSlide.position_do(); mapSlide.zoom_do(); mapSlide.rotate_do()" @wheel="mouse_zoom($event)">
        <div id="map_content" draggable="false" :key="CurrentFloor">
            <Transition name="map" mode="out-in">
                <component :is="MapDataCurrent" @showProperty="showProperty" />
            </Transition>
        </div>
    </div>
</template>