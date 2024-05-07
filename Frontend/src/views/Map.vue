<script setup>
import { onMounted, ref } from 'vue'
import PropertyView from '@/components/PropertyView.vue';

const isShowProperty = ref(false)
const point_PlaceId = ref("")
const Floor = ref(1)

// ドラッグなどとクリックを判別する
// <参考>
// https://qiita.com/_Keitaro_/items/375c5274bebf367f24e0
// https://qiita.com/KenjiOtsuka/items/da6d2dd2b81fef87e35d
var isClick = false
function showProperty(id) {
    // クリックされたときに、フラグが立っていたら
    if (isClick) {
        // alert(id)
        point_PlaceId.value = id
        isShowProperty.value = true
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

function hideProperty() {
    isShowProperty.value = false
}

const map_DefaultWidth = ref(0)
let map_size_width = 0
let map_size_height = 0
let map_size_ratio = 0
onMounted(() => {
    // 地図のデフォルトサイズを算出
    map_size_width = Number(document.querySelector("#map_content svg").getAttribute("width").slice(0, -2));
    map_size_height = Number(document.querySelector("#map_content svg").getAttribute("height").slice(0, -2));
    map_size_ratio = map_size_width / map_size_height

    resetMoving() //window_width, window_heightを使うので、ここでリセット
})

// 共通の変数
// 表示範囲のサイズ(仮)
let window_width = 0
let window_height = 0
// 地図の位置
const map_PositionLeft = ref()
const map_PositionTop = ref()
// 地図の倍率
const map_ZoomLevel = ref()
const map_ZoomLevelMax = 15
const map_ZoomLevelMin = 0.1
function map_Zoom(v) {
    // マップのズームをする関数
    // 範囲内であれば、ズームレベルを変更し、trueを返す
    if (map_ZoomLevel.value + v < map_ZoomLevelMax && map_ZoomLevel.value + v > map_ZoomLevelMin) {
        map_ZoomLevel.value += v
        return true
    } else {
        return false
    }
}
// 地図の回転角度
const map_Rotate = ref()
function map_Rotating(v) {
    map_Rotate.value += v
}

// リセット(PC・モバイル共通)
// ダブルクリックでリセット
function resetMoving() {
    // 表示範囲のサイズ(改)
    window_width = window.innerWidth
    window_height = window.innerHeight - getComputedStyle(document.querySelector("*")).getPropertyValue("--header-height").slice(0, -2)// CSSのヘッダー分を引く（CSS変数と同期）
    if (window_width / map_size_width > window_height / map_size_height) {
        // 縦幅に合わせる
        map_DefaultWidth.value = window_height * map_size_ratio
    } else {
        // 横幅に合わせる
        map_DefaultWidth.value = window_width
    }
    // リセット
    map_PositionLeft.value = window_width / 2
    map_PositionTop.value = window_height / 2
    map_ZoomLevel.value = 1
    map_Rotate.value = 0
    hideProperty()
}

// PC用
// ドラッグによる移動と回転
// フラグを、クリックをし始めたときに立て、離したときに解除する
// フラグが立っている間にマウスが動けば、その分だけ移動させる
// <参考>
// https://scrapbox.io/svg-wiki/%E3%83%9E%E3%82%A6%E3%82%B9%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E3%81%8F%E3%82%8B%E3%82%84%E3%81%A4%E3%81%AE%E5%AE%9F%E8%A3%85
// https://note.com/kabineko/n/n88ec426fff07
// https://qiita.com/akicho8/items/8522929fa619394ac9f4
function mouse_moveRotate(event) {
    if (event.buttons == 1) { // 左クリックが押されている場合のみ
        map_PositionLeft.value += event.movementX
        map_PositionTop.value += event.movementY
    } else if (event.buttons == 4) { // ホイールボタンが押されている場合のみ
        map_Rotating(event.movementX / 5)
    }
}
// ホイールによるズーム
// ホイールを上に回すと、一定の割合でズームイン
// ホイールを下に回すと、一定の割合でズームアウト
// <参考>
// https://mebee.info/2022/03/15/post-40363/
function mouse_zoom(event) {
    let map_ZoomLevel_Unit = .1
    if (event.wheelDelta + map_ZoomLevel_Unit > 0) {
        map_Zoom(+map_ZoomLevel_Unit)
    } else {
        map_Zoom(-map_ZoomLevel_Unit)
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
        map_PositionLeft.value += touch_temp_x - touch_last_x // 位置をずらす
        map_PositionTop.value += touch_temp_y - touch_last_y // 位置をずらす
        touch_last_x = touch_temp_x //最終値を更新
        touch_last_y = touch_temp_y //最終値を更新

        if (event.changedTouches.length === 2) { // タッチの指が2つの場合はzoomモード
            if (touch_mode == "zoom") {
                // すでにzoomモードになっている場合
                // 指の間隔を計算して、前との差からズームレベルを変更
                touch_diff = Math.sqrt((event.changedTouches[0].clientX - event.changedTouches[1].clientX) ** 2 + (event.changedTouches[0].clientY - event.changedTouches[1].clientY) ** 2)
                if (map_Zoom((touch_diff - touch_last_diff) * .005)) {
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
                    map_Rotating(touch_rotate - touch_last_rotate)
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

// デフォルトのピンチアウトを無効化
// <参考>
// https://moewe-net.com/js/disable-zoom
document.body.addEventListener('touchmove', (event) => {
    event.preventDefault();
}, { passive: false });
</script>


<style>
#box {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: fixed;
}

#map_content svg {
    position: absolute;
    background-color: #f0f0f0;
    width: v-bind((map_DefaultWidth * map_ZoomLevel) + 'px');
    height: auto;
    /* height: v-bind(map_ZoomLevel + '%'); */
    left: v-bind(map_PositionLeft + 'px');
    top: v-bind(map_PositionTop + 'px');
    /* 中心を基準にするためtranslate(-50%, -50%) */
    transform: translate(-50%, -50%) rotate(v-bind(map_Rotate + 'deg'));
    cursor: grab;
}

#map_content svg:active {
    cursor: grabbing;
}

.svg-text {
    transform-origin: center center;
    transform-box: fill-box;
    transform: rotate(v-bind(-map_Rotate + 'deg'));
}
</style>
<template>
    <PropertyView v-if="isShowProperty" :Floor="Floor" :PlaceId="point_PlaceId" @hideProperty="hideProperty()" />
    <div id="box" @dblclick="resetMoving()" @mousemove="mouse_moveRotate($event); click_notDetect()"
        @mousedown="click_Detect()" @touchmove="touch($event, 'doing'); click_notDetect();"
        @touchstart="touch($event, 'start'); click_Detect()" @wheel="mouse_zoom($event)">
        <div id="map_content" draggable="false">
            <div v-if="Floor == 1">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
                    xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" width="210mm" height="297mm"
                    viewBox="0 0 210 297" version="1.1" id="svg5" inkscape:version="1.2.1 (9c6d41e410, 2022-07-14)"
                    sodipodi:docname="map.svg" inkscape:export-filename="map-plane.svg" inkscape:export-xdpi="96"
                    inkscape:export-ydpi="96">
                    <sodipodi:namedview id="namedview7" pagecolor="#ffffff" bordercolor="#111111" borderopacity="1"
                        inkscape:showpageshadow="0" inkscape:pageopacity="0" inkscape:pagecheckerboard="1"
                        inkscape:deskcolor="#d1d1d1" inkscape:document-units="mm" showgrid="false" inkscape:zoom="0.5"
                        inkscape:cx="297" inkscape:cy="631" inkscape:window-width="1233" inkscape:window-height="1000"
                        inkscape:window-x="209" inkscape:window-y="110" inkscape:window-maximized="0"
                        inkscape:current-layer="layer2" />
                    <defs id="defs2">
                        <rect x="450.70526" y="863.36771" width="100.70789" height="71.483133" id="rect4228" />
                        <rect x="450.70526" y="863.36774" width="100.70789" height="71.483131" id="rect4228-6" />
                        <rect x="450.70526" y="863.36774" width="100.70789" height="71.483131" id="rect4228-7" />
                        <rect x="450.70526" y="863.36774" width="100.70789" height="71.483131" id="rect4228-6-9" />
                        <rect x="450.70526" y="863.36774" width="100.70789" height="71.483131" id="rect4228-72" />
                        <rect x="450.70526" y="863.36774" width="100.70789" height="71.483131" id="rect4228-6-5" />
                        <rect x="450.70526" y="863.36774" width="100.70789" height="71.483131" id="rect4228-7-1" />
                        <rect x="450.70526" y="863.36774" width="100.70789" height="71.483131" id="rect4228-6-9-7" />
                    </defs>
                    <g inkscape:label="none" inkscape:groupmode="layer" id="layer1">
                        <rect
                            style="fill:#e6e6e6;fill-opacity:1;stroke:#b3b3b3;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect5948" width="210" height="297" x="0" y="0" />
                        <rect
                            style="fill:#b3b3b3;fill-opacity:1;stroke:#b3b3b3;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-1-0-0" width="23.206863" height="14.617966" x="120.27374" y="141.298" />
                    </g>
                    <g inkscape:groupmode="layer" id="layer2" inkscape:label="1A" @click="showProperty('1A')"
                        class="1A">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-1-0-3" width="23.206858" height="25.95689" x="120.27374" y="33.470432" />
                        <g aria-label="1A" id="text4226-6-3-6"
                            style="-inkscape-font-specification:'Noto Sans';display:inline;font-family:'Noto Sans';font-size:28px;line-height:1.4;shape-inside:url(#rect4228-6-9-7);stop-color:#000000;stroke-linejoin:bevel;stroke-width:1.99999877198;text-orientation:upright;white-space:pre"
                            class="svg-text">
                            <path
                                d="M 129.677 49.0936 L 129.04 49.0936 L 129.04 45.3968 C 129.04 45.1844 129.042 45.014 129.047 44.8856 C 129.052 44.7572 129.059 44.6239 129.069 44.4856 C 128.99 44.5646 128.916 44.6313 128.847 44.6856 C 128.783 44.7399 128.704 44.8091 128.61 44.893 L 128.047 45.3524 L 127.706 44.9153 L 129.136 43.804 L 129.677 43.804 Z"
                                id="path550" />
                            <path
                                d="M 135.322 49.0936 L 134.685 47.4563 L 132.588 47.4563 L 131.959 49.0936 L 131.284 49.0936 L 133.351 43.7818 L 133.951 43.7818 L 136.011 49.0936 Z M 134.485 46.8636 L 133.892 45.2635 C 133.877 45.2239 133.853 45.1523 133.818 45.0486 C 133.783 44.9449 133.749 44.8387 133.714 44.7301 C 133.685 44.6165 133.66 44.53 133.64 44.4708 C 133.601 44.6239 133.559 44.7745 133.514 44.9227 C 133.475 45.0659 133.44 45.1795 133.411 45.2635 L 132.81 46.8636 Z"
                                id="path552" />
                        </g>
                    </g>
                    <g inkscape:groupmode="layer" id="layer3" inkscape:label="1B" @click="showProperty('1B')"
                        class="1B">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-16-1" width="23.206858" height="25.95689" x="120.27374" y="60.42733" />
                        <g aria-label="1B" id="text4226-7-3"
                            style="-inkscape-font-specification:'Noto Sans';display:inline;font-family:'Noto Sans';font-size:28px;line-height:1.4;shape-inside:url(#rect4228-7-1);stop-color:#000000;stroke-linejoin:bevel;stroke-width:1.99999877198;text-orientation:upright;white-space:pre"
                            class="svg-text">
                            <path
                                d="M 129.677 76.0506 L 129.04 76.0506 L 129.04 72.3538 C 129.04 72.1414 129.042 71.971 129.047 71.8426 C 129.052 71.7142 129.059 71.5809 129.069 71.4426 C 128.99 71.5216 128.916 71.5883 128.847 71.6426 C 128.783 71.6969 128.704 71.7661 128.61 71.85 L 128.047 72.3094 L 127.706 71.8723 L 129.136 70.761 L 129.677 70.761 Z"
                                id="path545" />
                            <path
                                d="M 132.003 70.761 L 133.514 70.761 C 134.171 70.761 134.67 70.8598 135.011 71.0573 C 135.352 71.2549 135.522 71.5932 135.522 72.0723 C 135.522 72.3834 135.435 72.6427 135.263 72.8502 C 135.09 73.0527 134.84 73.1835 134.514 73.2428 L 134.514 73.2798 C 134.737 73.3194 134.937 73.386 135.114 73.4799 C 135.297 73.5737 135.44 73.7071 135.544 73.8799 C 135.648 74.0528 135.7 74.275 135.7 74.5467 C 135.7 75.0257 135.534 75.3962 135.203 75.6579 C 134.877 75.9197 134.43 76.0506 133.862 76.0506 L 132.003 76.0506 Z M 132.67 73.0131 L 133.648 73.0131 C 134.097 73.0131 134.406 72.9415 134.574 72.7983 C 134.747 72.6501 134.833 72.4328 134.833 72.1464 C 134.833 71.855 134.729 71.6475 134.522 71.5241 C 134.319 71.3957 133.993 71.3315 133.544 71.3315 L 132.67 71.3315 Z M 132.67 73.5688 L 132.67 75.4875 L 133.737 75.4875 C 134.206 75.4875 134.532 75.3962 134.714 75.2134 C 134.897 75.0307 134.989 74.7911 134.989 74.4948 C 134.989 74.2182 134.892 73.996 134.7 73.8281 C 134.512 73.6552 134.174 73.5688 133.685 73.5688 Z"
                                id="path547" />
                        </g>
                    </g>
                    <g inkscape:groupmode="layer" id="layer4" inkscape:label="1C" @click="showProperty('1C')"
                        class="1C">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-1-5" width="23.206858" height="25.95689" x="120.27374" y="87.384224" />
                        <g aria-label="1C" id="text4226-6-0"
                            style="-inkscape-font-specification:'Noto Sans';display:inline;font-family:'Noto Sans';font-size:28px;line-height:1.4;shape-inside:url(#rect4228-6-5);stop-color:#000000;stroke-linejoin:bevel;stroke-width:1.99999877198;text-orientation:upright;white-space:pre"
                            class="svg-text">
                            <path
                                d="M 129.677 103.008 L 129.04 103.008 L 129.04 99.3108 C 129.04 99.0984 129.042 98.928 129.047 98.7996 C 129.052 98.6712 129.059 98.5379 129.069 98.3996 C 128.99 98.4786 128.916 98.5453 128.847 98.5996 C 128.783 98.6539 128.704 98.7231 128.61 98.807 L 128.047 99.2664 L 127.706 98.8293 L 129.136 97.718 L 129.677 97.718 Z"
                                id="path540" />
                            <path
                                d="M 134.27 98.2292 C 133.702 98.2292 133.255 98.4193 132.929 98.7996 C 132.603 99.1799 132.44 99.701 132.44 100.363 C 132.44 101.02 132.591 101.541 132.892 101.926 C 133.198 102.306 133.655 102.496 134.263 102.496 C 134.49 102.496 134.707 102.477 134.914 102.437 C 135.122 102.398 135.327 102.348 135.529 102.289 L 135.529 102.867 C 135.332 102.941 135.127 102.995 134.914 103.03 C 134.707 103.064 134.458 103.082 134.166 103.082 C 133.628 103.082 133.178 102.971 132.818 102.748 C 132.457 102.526 132.186 102.21 132.003 101.8 C 131.825 101.39 131.736 100.909 131.736 100.355 C 131.736 99.822 131.833 99.3528 132.025 98.9478 C 132.223 98.5379 132.512 98.2193 132.892 97.9921 C 133.272 97.76 133.734 97.6439 134.277 97.6439 C 134.835 97.6439 135.322 97.7476 135.737 97.9551 L 135.47 98.5181 C 135.307 98.444 135.124 98.3774 134.922 98.3181 C 134.724 98.2588 134.507 98.2292 134.27 98.2292 Z"
                                id="path542" />
                        </g>
                    </g>
                    <g inkscape:groupmode="layer" id="layer5" inkscape:label="1D" @click="showProperty('1D')"
                        class="1D">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-3" width="23.206858" height="25.95689" x="120.27374" y="114.34112" />
                        <g aria-label="1D" id="text4226-70"
                            style="-inkscape-font-specification:'Noto Sans';display:inline;font-family:'Noto Sans';font-size:28px;line-height:1.4;shape-inside:url(#rect4228-72);stop-color:#000000;stroke-linejoin:bevel;stroke-width:1.99999877198;text-orientation:upright;white-space:pre"
                            class="svg-text">
                            <path
                                d="M 129.677 129.964 L 129.04 129.964 L 129.04 126.267 C 129.04 126.054 129.042 125.884 129.047 125.756 C 129.052 125.627 129.059 125.494 129.069 125.356 C 128.99 125.435 128.916 125.501 128.847 125.556 C 128.783 125.61 128.704 125.679 128.61 125.763 L 128.047 126.222 L 127.706 125.785 L 129.136 124.674 L 129.677 124.674 Z"
                                id="path535" />
                            <path
                                d="M 136.241 127.267 C 136.241 128.161 135.996 128.835 135.507 129.289 C 135.023 129.739 134.346 129.964 133.477 129.964 L 132.003 129.964 L 132.003 124.674 L 133.633 124.674 C 134.161 124.674 134.621 124.773 135.011 124.97 C 135.406 125.168 135.71 125.459 135.922 125.845 C 136.134 126.23 136.241 126.704 136.241 127.267 Z M 135.537 127.289 C 135.537 126.583 135.361 126.067 135.011 125.741 C 134.665 125.41 134.174 125.244 133.536 125.244 L 132.67 125.244 L 132.67 129.393 L 133.388 129.393 C 134.821 129.393 135.537 128.692 135.537 127.289 Z"
                                id="path537" />
                        </g>
                    </g>
                    <g inkscape:groupmode="layer" id="layer6" inkscape:label="1E" @click="showProperty('1E')"
                        class="1E">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-1-0" width="23.206858" height="25.95689" x="120.27374" y="156.91597" />
                        <g aria-label="1E" id="text4226-6-3"
                            style="-inkscape-font-specification:'Noto Sans';display:inline;font-family:'Noto Sans';font-size:28px;line-height:1.4;shape-inside:url(#rect4228-6-9);stop-color:#000000;stroke-linejoin:bevel;stroke-width:1.99999877198;text-orientation:upright;white-space:pre"
                            class="svg-text">
                            <path
                                d="M 129.677 172.539 L 129.04 172.539 L 129.04 168.842 C 129.04 168.63 129.042 168.459 129.047 168.331 C 129.052 168.203 129.059 168.069 129.069 167.931 C 128.99 168.01 128.916 168.077 128.847 168.131 C 128.783 168.185 128.704 168.254 128.61 168.338 L 128.047 168.798 L 127.706 168.361 L 129.136 167.249 L 129.677 167.249 Z"
                                id="path530" />
                            <path
                                d="M 134.959 172.539 L 132.003 172.539 L 132.003 167.249 L 134.959 167.249 L 134.959 167.835 L 132.67 167.835 L 132.67 169.487 L 134.826 169.487 L 134.826 170.065 L 132.67 170.065 L 132.67 171.954 L 134.959 171.954 Z"
                                id="path532" />
                        </g>
                    </g>
                    <g inkscape:groupmode="layer" id="layer7" inkscape:label="1F" @click="showProperty('1F')"
                        class="1F">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-16" width="23.206858" height="25.95689" x="120.27374" y="183.87286" />
                        <g aria-label="1F" id="text4226-7"
                            style="-inkscape-font-specification:'Noto Sans';display:inline;font-family:'Noto Sans';font-size:28px;line-height:1.4;shape-inside:url(#rect4228-7);stop-color:#000000;stroke-linejoin:bevel;stroke-width:1.99999877198;text-orientation:upright;white-space:pre"
                            class="svg-text">
                            <path
                                d="M 129.677 199.496 L 129.04 199.496 L 129.04 195.799 C 129.04 195.587 129.042 195.416 129.047 195.288 C 129.052 195.159 129.059 195.026 129.069 194.888 C 128.99 194.967 128.916 195.033 128.847 195.088 C 128.783 195.142 128.704 195.211 128.61 195.295 L 128.047 195.755 L 127.706 195.317 L 129.136 194.206 L 129.677 194.206 Z"
                                id="path525" />
                            <path
                                d="M 132.67 199.496 L 132.003 199.496 L 132.003 194.206 L 134.959 194.206 L 134.959 194.791 L 132.67 194.791 L 132.67 196.666 L 134.818 196.666 L 134.818 197.251 L 132.67 197.251 Z"
                                id="path527" />
                        </g>
                    </g>
                    <g inkscape:groupmode="layer" id="layer8" inkscape:label="1G" @click="showProperty('1G')"
                        class="1G">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-1" width="23.206858" height="25.95689" x="120.27374" y="210.82976" />
                        <g aria-label="1G" id="text4226-6"
                            style="-inkscape-font-specification:'Noto Sans';display:inline;font-family:'Noto Sans';font-size:28px;line-height:1.4;shape-inside:url(#rect4228-6);stop-color:#000000;stroke-linejoin:bevel;stroke-width:1.99999877198;text-orientation:upright;white-space:pre"
                            class="svg-text">
                            <path
                                d="M 129.677 226.453 L 129.04 226.453 L 129.04 222.756 C 129.04 222.544 129.042 222.373 129.047 222.245 C 129.052 222.116 129.059 221.983 129.069 221.845 C 128.99 221.924 128.916 221.99 128.847 222.045 C 128.783 222.099 128.704 222.168 128.61 222.252 L 128.047 222.712 L 127.706 222.274 L 129.136 221.163 L 129.677 221.163 Z"
                                id="path520" />
                            <path
                                d="M 134.3 223.66 L 136.129 223.66 L 136.129 226.253 C 135.843 226.347 135.554 226.416 135.263 226.46 C 134.971 226.505 134.64 226.527 134.27 226.527 C 133.722 226.527 133.26 226.418 132.885 226.201 C 132.509 225.979 132.223 225.665 132.025 225.26 C 131.833 224.85 131.736 224.366 131.736 223.808 C 131.736 223.26 131.842 222.783 132.055 222.378 C 132.272 221.968 132.586 221.652 132.996 221.43 C 133.406 221.203 133.899 221.089 134.477 221.089 C 134.774 221.089 135.053 221.116 135.314 221.171 C 135.581 221.225 135.828 221.301 136.055 221.4 L 135.803 221.978 C 135.616 221.899 135.403 221.83 135.166 221.771 C 134.934 221.706 134.692 221.674 134.44 221.674 C 133.808 221.674 133.314 221.867 132.959 222.252 C 132.608 222.632 132.433 223.151 132.433 223.808 C 132.433 224.228 132.499 224.601 132.633 224.927 C 132.771 225.248 132.986 225.499 133.277 225.682 C 133.569 225.86 133.951 225.949 134.425 225.949 C 134.658 225.949 134.855 225.937 135.018 225.912 C 135.181 225.887 135.329 225.858 135.463 225.823 L 135.463 224.252 L 134.3 224.252 Z"
                                id="path522" />
                        </g>
                    </g>
                    <g inkscape:groupmode="layer" id="layer9" inkscape:label="1H" @click="showProperty('1H')"
                        class="1H">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234" width="23.206858" height="25.95689" x="120.27374" y="237.78665" />
                        <g aria-label="1H" id="text4226"
                            style="-inkscape-font-specification:'Noto Sans';display:inline;font-family:'Noto Sans';font-size:28px;line-height:1.4;shape-inside:url(#rect4228);stop-color:#000000;stroke-linejoin:bevel;stroke-width:1.99999877198;text-orientation:upright;white-space:pre"
                            class="svg-text">
                            <path
                                d="M 129.677 253.41 L 129.04 253.41 L 129.04 249.713 C 129.04 249.5 129.042 249.33 129.047 249.202 C 129.052 249.073 129.059 248.94 129.069 248.802 C 128.99 248.881 128.916 248.947 128.847 249.002 C 128.783 249.056 128.704 249.125 128.61 249.209 L 128.047 249.668 L 127.706 249.231 L 129.136 248.12 L 129.677 248.12 Z"
                                id="path515" />
                            <path
                                d="M 136.048 253.41 L 135.381 253.41 L 135.381 250.943 L 132.67 250.943 L 132.67 253.41 L 132.003 253.41 L 132.003 248.12 L 132.67 248.12 L 132.67 250.357 L 135.381 250.357 L 135.381 248.12 L 136.048 248.12 Z"
                                id="path517" />
                        </g>
                    </g>
                </svg>
            </div>
            <div v-else-if="Floor == 2">
                2f
            </div>
            <div v-else-if="Floor == 3">
                3f
            </div>
        </div>
    </div>
</template>