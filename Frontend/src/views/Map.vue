<script setup>
import { onMounted, ref } from 'vue'
import PropertyView from '@/components/PropertyView.vue';

const isShowProperty = ref(false)
const point_PlaceId = ref("")
const point_Floor = ref()

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
        point_Floor.value = 1   // 仮の値
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
onMounted(() => {
    // 表示範囲のサイズ(改)
    window_width = window.innerWidth
    window_height = window.innerHeight - getComputedStyle(document.querySelector("*")).getPropertyValue("--header-height").slice(0, -2)// CSSのヘッダー分を引く（CSS変数と同期）
    console.log(getComputedStyle(document.querySelector("*")).getPropertyValue("--header-height"));
    // 地図のデフォルトサイズを算出
    const map_size_width = Number(document.querySelector("#map_content svg").getAttribute("width").slice(0, -2));
    const map_size_height = Number(document.querySelector("#map_content svg").getAttribute("height").slice(0, -2));
    const map_size_ratio = map_size_width / map_size_height
    if (window_width / map_size_width > window_height / map_size_height) {
        // 縦幅に合わせる
        map_DefaultWidth.value = window_height * map_size_ratio
    } else {
        // 横幅に合わせる
        map_DefaultWidth.value = window_width
    }
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
// 地図の回転角度
const map_Rotate = ref()

// リセット(PC・モバイル共通)
// ダブルクリックでリセット
function resetMoving() {
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
        map_Rotate.value += (event.movementX / 5)
    }
}
// ホイールによるズーム
// ホイールを上に回すと、一定の割合でズームイン
// ホイールを下に回すと、一定の割合でズームアウト
// <参考>
// https://mebee.info/2022/03/15/post-40363/
function mouse_zoom(event) {
    if (event.wheelDelta > 0) {
        map_ZoomLevel.value += .1
    } else {
        map_ZoomLevel.value -= .1
    }
}

// モバイル用
// タッチによる操作(移動とズーム共通)
// <参考>
// https://qiita.com/shigeta1019/items/23a78e5d00d641b0384c
// https://qiita.com/tonio0720/items/6facacac5db6d68f1a13
// lastがついてる変数は、直前の値を保存するため
let touch_mode = ""
// moveモード用の変数
// move: 1つの指で移動
// zoom: 2つの指でズーム・回転
let touch_last_x = 0
let touch_last_y = 0
// zoomモード用の変数
let touch_last_diff = 0
let touch_diff = 0
let touch_last_rotate = 0
let touch_rotate = 0
function touch(event, status) {
    if (status === 'start') {
        // タップし始めは、それぞれの初期処理をあてるために値を変更
        touch_mode = "none"
    } else if (status === 'move') { // 指を動かしたときは、それぞれの処理を行う
        if (event.changedTouches.length === 1) { // タッチの指が1つの場合はmoveモード
            if (touch_mode === "move") {
                // すでにmoveモードになっている場合は、指を動かした分だけ位置をずらす
                map_PositionLeft.value += event.changedTouches[0].clientX - touch_last_x
                map_PositionTop.value += event.changedTouches[0].clientY - touch_last_y
                touch_last_x = event.changedTouches[0].clientX //最終値を更新
                touch_last_y = event.changedTouches[0].clientY //最終値を更新
            } else {
                //moveモードになっていない場合の初期処理
                touch_mode = "move"
                touch_last_x = event.changedTouches[0].clientX //押した位置を相対位置の基準にする
                touch_last_y = event.changedTouches[0].clientY
            }
        } else if (event.changedTouches.length === 2) { // タッチの指が2つの場合はzoomモード
            if (touch_mode == "zoom") {
                // すでにzoomモードになっている場合
                // 指の間隔を計算して、前との差からズームレベルを変更
                touch_diff = Math.sqrt((event.changedTouches[0].clientX - event.changedTouches[1].clientX) ** 2 + (event.changedTouches[0].clientY - event.changedTouches[1].clientY) ** 2)
                map_ZoomLevel.value += (touch_diff - touch_last_diff) * .005
                touch_last_diff = touch_diff //最終値を更新

                // 2点を結ぶ直線の傾きを計算して、前との差から回転角度を変更
                touch_rotate = (Math.atan2((event.changedTouches[1].clientY - event.changedTouches[0].clientY), (event.changedTouches[1].clientX - event.changedTouches[0].clientX))) * (180 / Math.PI)
                map_Rotate.value += touch_rotate - touch_last_rotate
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
// https://moewe-net.com/js/disable-zoom
document.body.addEventListener('touchmove', (event) => {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
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
</style>
<template>
    <PropertyView v-if="isShowProperty" :Floor="point_Floor" :PlaceId="point_PlaceId" @hideProperty="hideProperty()" />
    <div id="box">
        <div id="map_content" @mousemove="mouse_moveRotate($event); click_notDetect()" @mousedown="click_Detect()"
            @dblclick="resetMoving()" @touchmove="touch($event, 'move'); click_notDetect();"
            @touchstart="touch($event, 'start'); click_Detect()" @wheel="mouse_zoom($event)" draggable="false">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
                xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" width="210mm" height="297mm"
                viewBox="0 0 210 297" version="1.1" id="map_svg" inkscape:version="1.2.1 (9c6d41e410, 2022-07-14)"
                sodipodi:docname="描画.svg" inkscape:export-filename="描画-plane.svg" inkscape:export-xdpi="96"
                inkscape:export-ydpi="96">
                <sodipodi:namedview id="namedview7" pagecolor="#ffffff" bordercolor="#111111" borderopacity="1"
                    inkscape:showInfopageshadow="0" inkscape:pageopacity="0" inkscape:pagecheckerboard="1"
                    inkscape:deskcolor="#d1d1d1" inkscape:document-units="mm" showInfogrid="false"
                    inkscape:zoom="0.53858859" inkscape:cx="144.82297" inkscape:cy="600.64399"
                    inkscape:window-width="1014" inkscape:window-height="1032" inkscape:window-x="163"
                    inkscape:window-y="27" inkscape:window-maximized="0" inkscape:current-layer="layer5" />
                <defs id="defs2" />
                <g inkscape:label="れいやー" inkscape:groupmode="layer" id="layer1" class="れいやー">
                    <rect
                        style="fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                        id="rect234" width="115.93574" height="117.4095" x="54.529099" y="33.405212"
                        inkscape:label="四角形" @click="showProperty('四角形')" class="四角形" />
                    <g inkscape:groupmode="layer" id="layer2" inkscape:label="れいやー 2" @click="showProperty('れいやー 2')"
                        class="れいやー 2">
                        <rect
                            style="fill:#000000;fill-opacity:1;stroke:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect3079" width="57.476616" height="48.63406" x="24.790791" y="154.74472" />
                    </g>
                    <g inkscape:groupmode="layer" id="layer3" inkscape:label="1" @click="showProperty('1')" class="1">
                        <rect style="fill:#000000;stroke-width:2;stroke-linecap:round;stop-color:#000000" id="rect347"
                            width="37.335236" height="43.230274" x="156.70975" y="221.55516" />
                    </g>
                    <g inkscape:groupmode="layer" id="layer4" inkscape:label="2" @click="showProperty('2')" class="2">
                        <rect style="fill:#000000;stroke-width:2;stroke-linecap:round;stop-color:#000000" id="rect345"
                            width="38.808994" height="47.651554" x="90.881828" y="226.4677" />
                    </g>
                    <g inkscape:groupmode="layer" id="layer5" inkscape:label="33a" @click="showProperty('33a')"
                        class="33a">
                        <rect style="fill:#000000;stroke-width:2;stroke-linecap:round;stop-color:#000000" id="rect343"
                            width="45.686539" height="44.21278" x="27.510172" y="226.4677" />
                    </g>
                </g>
            </svg>
        </div>
    </div>
</template>