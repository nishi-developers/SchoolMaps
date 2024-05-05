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
</style>
<template>
    <PropertyView v-if="isShowProperty" :Floor="Floor" :PlaceId="point_PlaceId" @hideProperty="hideProperty()" />
    <div id="box" @dblclick="resetMoving()">
        <div id="map_content" @mousemove="mouse_moveRotate($event); click_notDetect()" @mousedown="click_Detect()"
            @touchmove="touch($event, 'move'); click_notDetect();" @touchstart="touch($event, 'start'); click_Detect()"
            @wheel="mouse_zoom($event)" draggable="false">
            <div v-if="Floor == 1">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
                    xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" width="210mm" height="297mm"
                    viewBox="0 0 210 297" version="1.1" id="svg5" inkscape:version="1.2.1 (9c6d41e410, 2022-07-14)"
                    sodipodi:docname="map.svg" inkscape:export-filename="map-plane.svg" inkscape:export-xdpi="96"
                    inkscape:export-ydpi="96">
                    <sodipodi:namedview id="namedview7" pagecolor="#ffffff" bordercolor="#111111" borderopacity="1"
                        inkscape:showpageshadow="0" inkscape:pageopacity="0" inkscape:pagecheckerboard="1"
                        inkscape:deskcolor="#d1d1d1" inkscape:document-units="mm" showgrid="false" inkscape:zoom="0.5"
                        inkscape:cx="43" inkscape:cy="639" inkscape:window-width="1233" inkscape:window-height="1000"
                        inkscape:window-x="671" inkscape:window-y="0" inkscape:window-maximized="0"
                        inkscape:current-layer="layer1" />
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
                        <text xml:space="preserve" transform="matrix(0.26458333,0,0,0.26458333,7.7978913,-186.63517)"
                            id="text4226-6-3-6"
                            style="font-size:28px;line-height:1.4;font-family:'Noto Sans';-inkscape-font-specification:'Noto Sans';text-decoration-color:#000000;text-orientation:upright;white-space:pre;shape-inside:url(#rect4228-6-9-7);display:inline;fill:#000000;fill-opacity:1;stroke-width:7.55906;stroke-linejoin:bevel;stop-color:#000000">
                            <tspan x="450.70508" y="890.94369" id="tspan377">1A</tspan>
                        </text>
                    </g>
                    <g inkscape:groupmode="layer" id="layer3" inkscape:label="1B" @click="showProperty('1B')"
                        class="1B">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-16-1" width="23.206858" height="25.95689" x="120.27374" y="60.42733" />
                        <text xml:space="preserve" transform="matrix(0.26458333,0,0,0.26458333,7.7978934,-159.67829)"
                            id="text4226-7-3"
                            style="font-size:28px;line-height:1.4;font-family:'Noto Sans';-inkscape-font-specification:'Noto Sans';text-decoration-color:#000000;text-orientation:upright;white-space:pre;shape-inside:url(#rect4228-7-1);display:inline;fill:#000000;fill-opacity:1;stroke-width:7.55906;stroke-linejoin:bevel;stop-color:#000000">
                            <tspan x="450.70508" y="890.94369" id="tspan379">1B</tspan>
                        </text>
                    </g>
                    <g inkscape:groupmode="layer" id="layer4" inkscape:label="1C" @click="showProperty('1C')"
                        class="1C">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-1-5" width="23.206858" height="25.95689" x="120.27374" y="87.384224" />
                        <text xml:space="preserve" transform="matrix(0.26458333,0,0,0.26458333,7.7978894,-132.72139)"
                            id="text4226-6-0"
                            style="font-size:28px;line-height:1.4;font-family:'Noto Sans';-inkscape-font-specification:'Noto Sans';text-decoration-color:#000000;text-orientation:upright;white-space:pre;shape-inside:url(#rect4228-6-5);display:inline;fill:#000000;fill-opacity:1;stroke-width:7.55906;stroke-linejoin:bevel;stop-color:#000000">
                            <tspan x="450.70508" y="890.94369" id="tspan381">1C</tspan>
                        </text>
                    </g>
                    <g inkscape:groupmode="layer" id="layer5" inkscape:label="1D" @click="showProperty('1D')"
                        class="1D">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-3" width="23.206858" height="25.95689" x="120.27374" y="114.34112" />
                        <text xml:space="preserve" transform="matrix(0.26458333,0,0,0.26458333,7.7978913,-105.76451)"
                            id="text4226-70"
                            style="font-size:28px;line-height:1.4;font-family:'Noto Sans';-inkscape-font-specification:'Noto Sans';text-decoration-color:#000000;text-orientation:upright;white-space:pre;shape-inside:url(#rect4228-72);display:inline;fill:#000000;fill-opacity:1;stroke-width:7.55906;stroke-linejoin:bevel;stop-color:#000000">
                            <tspan x="450.70508" y="890.94369" id="tspan383">1D</tspan>
                        </text>
                    </g>
                    <g inkscape:groupmode="layer" id="layer6" inkscape:label="1E" @click="showProperty('1E')"
                        class="1E">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-1-0" width="23.206858" height="25.95689" x="120.27374" y="156.91597" />
                        <text xml:space="preserve" transform="matrix(0.26458333,0,0,0.26458333,7.797891,-63.189633)"
                            id="text4226-6-3"
                            style="font-size:28px;line-height:1.4;font-family:'Noto Sans';-inkscape-font-specification:'Noto Sans';text-decoration-color:#000000;text-orientation:upright;white-space:pre;shape-inside:url(#rect4228-6-9);display:inline;fill:#000000;fill-opacity:1;stroke-width:7.55906;stroke-linejoin:bevel;stop-color:#000000">
                            <tspan x="450.70508" y="890.94369" id="tspan385">1E</tspan>
                        </text>
                    </g>
                    <g inkscape:groupmode="layer" id="layer7" inkscape:label="1F" @click="showProperty('1F')"
                        class="1F">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-16" width="23.206858" height="25.95689" x="120.27374" y="183.87286" />
                        <text xml:space="preserve" transform="matrix(0.26458333,0,0,0.26458333,7.7978929,-36.232756)"
                            id="text4226-7"
                            style="font-size:28px;line-height:1.4;font-family:'Noto Sans';-inkscape-font-specification:'Noto Sans';text-decoration-color:#000000;text-orientation:upright;white-space:pre;shape-inside:url(#rect4228-7);display:inline;fill:#000000;fill-opacity:1;stroke-width:7.55906;stroke-linejoin:bevel;stop-color:#000000">
                            <tspan x="450.70508" y="890.94369" id="tspan387">1F</tspan>
                        </text>
                    </g>
                    <g inkscape:groupmode="layer" id="layer8" inkscape:label="1G" @click="showProperty('1G')"
                        class="1G">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234-1" width="23.206858" height="25.95689" x="120.27374" y="210.82976" />
                        <text xml:space="preserve" transform="matrix(0.26458333,0,0,0.26458333,7.7978894,-9.2758522)"
                            id="text4226-6"
                            style="font-size:28px;line-height:1.4;font-family:'Noto Sans';-inkscape-font-specification:'Noto Sans';text-decoration-color:#000000;text-orientation:upright;white-space:pre;shape-inside:url(#rect4228-6);display:inline;fill:#000000;fill-opacity:1;stroke-width:7.55906;stroke-linejoin:bevel;stop-color:#000000">
                            <tspan x="450.70508" y="890.94369" id="tspan389">1G</tspan>
                        </text>
                    </g>
                    <g inkscape:groupmode="layer" id="layer9" inkscape:label="1H" @click="showProperty('1H')"
                        class="1H">
                        <rect
                            style="fill:#b3e4e5;fill-opacity:1;stroke:#000000;stroke-width:1;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;stop-color:#000000"
                            id="rect234" width="23.206858" height="25.95689" x="120.27374" y="237.78665" />
                        <text xml:space="preserve" transform="matrix(0.26458333,0,0,0.26458333,7.7978913,17.681026)"
                            id="text4226"
                            style="font-size:28px;line-height:1.4;font-family:'Noto Sans';-inkscape-font-specification:'Noto Sans';text-decoration-color:#000000;text-orientation:upright;white-space:pre;shape-inside:url(#rect4228);display:inline;fill:#000000;fill-opacity:1;stroke-width:7.55906;stroke-linejoin:bevel;stop-color:#000000">
                            <tspan x="450.70508" y="890.94369" id="tspan391">1H</tspan>
                        </text>
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