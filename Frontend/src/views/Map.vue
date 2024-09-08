<script setup>
import { onMounted, ref, defineAsyncComponent, watch } from 'vue'
import PropertyView from '@/components/PropertyView.vue';
import PlaceInfo from '@/assets/PlaceInfo.json'
import { event } from 'vue-gtag'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

const selectedId = ref("")
const isShowWrapper = ref(true)

class propertyClass {
    // ドラッグなどとクリックを判別する
    // <参考>
    // https://qiita.com/_Keitaro_/items/375c5274bebf367f24e0
    // https://qiita.com/KenjiOtsuka/items/da6d2dd2b81fef87e35d
    constructor() {
        this.isClick = false
        this.isDubleClick = false
        this.isShowProperty = ref(false)
    }
    show(mouseEvent) {
        // setTimeoutのコールバック関数内でthisを使用するとthisはグローバルオブジェクトを指すため、thisを使う代わりにクラスのプロパティを使う
        // クリックされたときに、フラグが立っていたら
        // let isClick_ = this.isClick
        // this.isClick = false
        if (property.isClick) {
            property.isClick = false
            property.isDubleClick = false
            // ダブルクリックと判定されるまでの時間を遅らせる
            setTimeout(() => {
                if (!property.isDubleClick) {
                    // idを取得
                    isShowWrapper.value = false
                    setTimeout(() => {
                        const clickedObject = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY);
                        if (clickedObject.getAttribute('placeid') == null) {
                            isShowWrapper.value = true
                            return
                        }
                        const id = clickedObject.getAttribute('placeid')
                        isShowWrapper.value = true
                        // 存在する場所かどうかをチェック
                        if (Object.keys(PlaceInfo[CurrentFloor.value]).includes(id)) {
                            event(`open{${CurrentFloor.value}/${id}}`)
                            point_PlaceId.value = id
                            if (property.isShowProperty.value) {
                                // すでに表示されている場合は、一旦閉じてから開く
                                property.hide(true)
                                setTimeout(() => {
                                    property.isShowProperty.value = true
                                }, 50);
                            } else {
                                // 表示されていない場合は、即時表示
                                property.isShowProperty.value = true
                            }
                            selectedId.value = id
                            changeURL(CurrentFloor.value, id); //hide()の後に実行
                            return true //ここは瞬時なので注意
                        } else {
                            return false
                        }
                    }, 0);
                }
            }, 200)
        }
    }
    click_Detect() {
        // クリック開始が検出されたときにフラグを立てる
        this.isClick = true
    }
    click_notDetect() {
        // クリックではなくドラックだとわかったときにフラグを解除する
        this.isClick = false
    }
    click_dubleDetect() {
        // ダブルクリックが検出されたときにフラグを立てる
        this.isDubleClick = true
    }

    hide(isChangeURL = false) {
        this.isShowProperty.value = false
        selectedId.value = ""
        if (isChangeURL) {
            changeURL(CurrentFloor.value, null)
        }
    }
}
let property = new propertyClass()

// マップの切り替え
let MapDataCurrent = null
function changeMapData(floor) {
    MapDataCurrent = defineAsyncComponent(() => import(`@/assets/floors/${floor}.vue`))
}

const point_PlaceId = ref("")
const CurrentFloor = ref()
function changeFloor(floor) {
    CurrentFloor.value = floor
    property.hide() //これがないと、フロアが変わったときに、プロパティが表示できずエラーになる
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
        property.isClick = true
        if (!property.show(route.params.id)) {
            changeURL(CurrentFloor.value, null)
        }
    }
})

/*
語録

動かし方
mouse
touch

動く要素
position
rotate
zoom

順番
control
move
slide

階
floor

プロパティ
property
*/



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
            if (mouseORtouch === "touch") {
                // touch
                position_speedMin = 0.01
                position_frictionLevel = 0.95
            }
            // 速度が0になるまで、位置を変更
            if (Math.abs(this.position_speedX) > position_speedMin || Math.abs(this.position_speedY) > position_speedMin) {
                if (mapMove.PositionRangeCheck(this.position_speedX * 4, this.position_speedY * 4)) {
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
            if (mouseORtouch === "touch") {
                // touch
                zoom_speedMin = 0.0001
                zoom_frictionLevel = 0.8
            }
            if (Math.abs(this.zoom_speed) > zoom_speedMin && mapMove.ZoomLevel.value + this.zoom_speed * 4 < mapMove.ZoomLevelMax && mapMove.ZoomLevel.value + this.zoom_speed * 4 > mapMove.ZoomLevelMin) {
                mapMove.ZoomLevel.value += this.zoom_speed * 4
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
            if (mouseORtouch === "touch") {
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
        this.ZoomLevel = ref()
        this.ZoomLevelMax = 15
        this.ZoomLevelMin = 0.001
        // 地図の回転
        this.map_Rotate = ref()
    }
    PositionRangeCheck(x, y) {
        // 移動先が範囲内かどうかをチェックする関数
        // ズームでどうしても範囲外に出てしまうため、戻す動きは制限しない
        // 中心はマップの中心
        // 回転を考慮したマップのサイズを算出
        // Issues #15 に詳細あり
        let radian = this.map_Rotate.value * (Math.PI / 180);
        let A = map_DefaultWidth.value
        let B = map_DefaultWidth.value / map_size_ratio
        let temp_width = Math.abs(A * Math.cos(radian)) + Math.abs(B * Math.sin(radian))
        let temp_height = Math.abs(A * Math.sin(radian)) + Math.abs(B * Math.cos(radian))
        // 範囲内かどうかをチェック
        if (x > 0 && this.map_PositionLeft.value + x > (temp_width * mapMove.ZoomLevel.value / 2) + window_width) {
            // 右端
            return false
        }
        else if (x < 0 && this.map_PositionLeft.value + x < -(temp_width * mapMove.ZoomLevel.value / 2)) {
            // 左端
            return false
        }
        else if (y > 0 && this.map_PositionTop.value + y > ((temp_height * mapMove.ZoomLevel.value) / 2) + window_height) {
            // 下端
            return false
        }
        else if (y < 0 && this.map_PositionTop.value + y < (-((temp_height * mapMove.ZoomLevel.value) / 2))) {
            // 上端
            return false
        } else {
            return true
        }
    }
    PositionMove(x, y) {
        mapSlide.position_stop() //慣性動作中に動かされた場合は、ここでリセットをかける
        if (this.PositionRangeCheck(x, y)) {
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
    Zoom(v) {
        // マップのズームをする関数
        // ズームの慣性の実装は、PCとスマホで異なるため、それぞれの場所で実装
        // 範囲内であれば、ズームレベルを変更し、trueを返す
        if (v != 0) {
            if (this.ZoomLevel.value + v < this.ZoomLevelMax && this.ZoomLevel.value + v > this.ZoomLevelMin) {
                mapSlide.zoom_stop() //慣性動作中に動かされた場合は、ここでリセットをかける
                this.ZoomLevel.value += v
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }
    Rotating(v) {
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
        this.ZoomLevel.value = 1
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
    property.hide(true)
    if (window_width < window_height) {
        deviceMode.value = "mobile"
    } else {
        deviceMode.value = "pc"
    }
}

let mouseORtouch = ""

class controlMouseClass {
    // PC用
    // ドラッグによる移動と回転
    // フラグを、クリックをし始めたときに立て、離したときに解除する
    // フラグが立っている間にマウスが動けば、その分だけ移動させる
    // <参考>
    // https://scrapbox.io/svg-wiki/%E3%83%9E%E3%82%A6%E3%82%B9%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E3%81%8F%E3%82%8B%E3%82%84%E3%81%A4%E3%81%AE%E5%AE%9F%E8%A3%85
    // https://note.com/kabineko/n/n88ec426fff07
    // https://qiita.com/akicho8/items/8522929fa619394ac9f4
    mouse_moveRotate(event) {
        mouseORtouch = "mouse"
        if (event.buttons === 1) { // 左クリックが押されている場合のみ
            mapMove.PositionMove(event.movementX, event.movementY)
        } else if (event.buttons === 4) { // ホイールボタンが押されている場合のみ
            if (event.movementX > 0) {
                mapMove.Rotating(Math.sqrt(event.movementX ** 2 + event.movementY ** 2) / 5)
            } else {
                mapMove.Rotating(-Math.sqrt(event.movementX ** 2 + event.movementY ** 2) / 5)
            }
        }
    }
    // ホイールによるズーム
    // ホイールを上に回すと、一定の割合でズームイン
    // ホイールを下に回すと、一定の割合でズームアウト
    // <参考>
    // https://mebee.info/2022/03/15/post-40363/
    mouse_zoom(event) {
        mouseORtouch = "mouse"
        let num = 0
        let ZoomLevel_Unit = .1
        if (event.wheelDelta + ZoomLevel_Unit > 0) {
            num = ZoomLevel_Unit
        } else {
            num = -ZoomLevel_Unit
        }
        if (mapMove.Zoom(num)) {
            mapSlide.zoom_speed = num / 5
            mapSlide.zoom_do()
        }
    }
}
let controlMouse = new controlMouseClass()

class controlTouchClass {
    // モバイル用
    // タッチによる操作(移動とズーム共通)
    // <参考>
    // https://qiita.com/shigeta1019/items/23a78e5d00d641b0384c
    // https://qiita.com/tonio0720/items/6facacac5db6d68f1a13
    constructor() {
        // lastがついてる変数は、直前の値を保存するため
        this.mode = ""
        // move: 移動(何本の指でも)
        // zoom: 2つの指でズーム・回転
        // moveモード用の変数
        this.last_x = 0
        this.last_y = 0
        this.temp_x = 0
        this.temp_y = 0
        this.last_finger = 0
        // zoomモード用の変数
        this.last_diff = 0
        this.diff = 0
        this.last_rotate = 0
        this.rotate = 0
        // タップし始めてどれぐらい動かしたら
        this.zoomed = 0
        this.rotated = 0
        this.acceptRotate = false
        // // タッチの位置
        // this.touch_place = []
        // this.touch_place_last = []
        // this.touch_finger = 0
    }
    // 2点間の距離を計算する関数
    positionLength(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
    }
    // タッチの位置を取得する関数
    // タッチの指が複数ある場合は、それぞれの位置を取得して平均を取る
    positionAverage(event) {
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
    touch(event, status) {
        mouseORtouch = "touch"
        if (status === 'start') {
            // タップし始めは、初期処理をあてるために値を変更
            this.mode = "none"
            this.last_finger = 0
            // タップし始めてどれぐらい動かしたらをリセット
            this.zoomed = 0
            this.rotated = 0
            this.acceptRotate = false
        } else if (status === 'doing') { // 指を動かしたときは、それぞれの処理を行う
            // タッチの本数にかかわらず、moveモード
            // 本数が変わった場合、もしくは距離が飛んだ場合は、初期位置を変更(初期処理)
            [this.temp_x, this.temp_y] = this.positionAverage(event)
            if (this.last_finger != event.changedTouches.length || this.positionLength(this.last_x, this.last_y, this.temp_x, this.temp_y) > 50) {
                [this.last_x, this.last_y] = this.positionAverage(event) //押した位置を相対位置の基準にする
                this.last_finger = event.changedTouches.length
            }
            mapMove.PositionMove(this.temp_x - this.last_x, this.temp_y - this.last_y) // 位置をずらす
            this.last_x = this.temp_x //最終値を更新
            this.last_y = this.temp_y //最終値を更新

            if (event.changedTouches.length === 2) { // タッチの指が2つの場合はzoomモード
                if (this.mode === "zoom") {
                    // すでにzoomモードになっている場合
                    // 指の間隔を計算して、前との差からズームレベルを変更
                    this.diff = this.positionLength(event.changedTouches[0].clientX, event.changedTouches[0].clientY, event.changedTouches[1].clientX, event.changedTouches[1].clientY)
                    // this.diff = Math.sqrt((event.changedTouches[0].clientX - event.changedTouches[1].clientX) ** 2 + (event.changedTouches[0].clientY - event.changedTouches[1].clientY) ** 2)
                    if (mapMove.Zoom((this.diff - this.last_diff) * .005)) {
                        // 慣性の実装
                        if (mapSlide.zoom_lastMovedTime != 0) {
                            mapSlide.zoom_speed = (this.diff - this.last_diff) * .005 / (Date.now() - mapSlide.zoom_lastMovedTime)
                        }
                        mapSlide.zoom_lastMovedTime = Date.now()
                        this.zoomed += Math.abs(this.diff - this.last_diff) //ズームした合計量を記録
                        this.last_diff = this.diff //最終値を更新
                    }
                    // 2点を結ぶ直線の傾きを計算して、前との差から回転角度を変更
                    this.rotate = (Math.atan2((event.changedTouches[1].clientY - event.changedTouches[0].clientY), (event.changedTouches[1].clientX - event.changedTouches[0].clientX))) * (180 / Math.PI)
                    this.rotated += Math.abs(this.rotate - this.last_rotate) //回転した合計量を記録
                    if (this.rotated > 10 && this.zoomed < 40) { //ズームをブロックする移動量(要調整)
                        // あまりズームせずに回転した場合は、指を離すまで回転を許可
                        this.acceptRotate = true
                    }
                    if (this.acceptRotate) {
                        mapMove.Rotating(this.rotate - this.last_rotate)
                    }
                    this.last_rotate = this.rotate //最終値を更新
                } else {
                    //zoomモードになっていない場合の初期処理
                    this.mode = "zoom"
                    this.last_diff = this.positionLength(event.changedTouches[0].clientX, event.changedTouches[0].clientY, event.changedTouches[1].clientX, event.changedTouches[1].clientY)
                    // this.last_diff = Math.sqrt((event.changedTouches[0].clientX - event.changedTouches[1].clientX) ** 2 + (event.changedTouches[0].clientY - event.changedTouches[1].clientY) ** 2)
                    this.last_rotate = (Math.atan2((event.changedTouches[1].clientY - event.changedTouches[0].clientY), (event.changedTouches[1].clientX - event.changedTouches[0].clientX))) * (180 / Math.PI)
                }
            }
        }
    }
}
let controlTouch = new controlTouchClass()

// デフォルトのピンチアウトを無効化
// 1本をブロックすると、プロパティでのスクロールが無効化されるため、2本以上をブロックする
// <参考>
// https://moewe-net.com/js/disable-zoom
document.body.addEventListener('touchmove', (event) => {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, { passive: false });

// IDに基づくマップデータの加工
function setMapData() {
    console.log("setMapData");

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
}

// setTimeout(() => {
//     setMapData()
// }, 1000);

watch(selectedId, (newVal, oldVal) => {
    if (newVal != "") {
        document.querySelectorAll(`[placeid="${newVal}"]`).forEach((element) => {
            element.classList.add("selected")
        })
    }
    if (oldVal != "") {
        document.querySelectorAll(`[placeid="${oldVal}"]`).forEach((element) => {
            element.classList.remove("selected")
        })
    }
})
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
    transform: rotate(v-bind("- mapMove.map_Rotate.value + 'deg'"));
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
    width: v-bind("(map_DefaultWidth * mapMove.ZoomLevel.value) + 'px'");
    height: auto;
    left: v-bind("mapMove.map_PositionLeft.value + 'px'");
    top: v-bind("mapMove.map_PositionTop.value + 'px'");
    transform: translate(-50%, -50%) rotate(v-bind("mapMove.map_Rotate.value + 'deg'"));

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
        <PropertyView v-if="property.isShowProperty.value" :Floor="CurrentFloor" :PlaceId="point_PlaceId"
            :deviceMode="deviceMode" @hideProperty="property.hide(true)" />
    </Transition>
    <div id="floorMenu">
        <ul>
            <li class="search"><font-awesome-icon @click="router.push('/search')" :icon="['fas', 'magnifying-glass']" />
            </li>
            <li class="floor" v-for="floor in PlaceInfoReverse" :key="floor.__key__" @click="changeFloor(floor.__key__)"
                :class="floor.__key__ === CurrentFloor ? 'selected' : 'notselected'">
                {{ floor.__FloorName__ }}</li>
        </ul>
    </div>
    <div v-if="isShowWrapper" id="wrapperBox" @click="property.show($event)"
        @dblclick="resetMoving(); property.click_dubleDetect()"
        @mousemove="controlMouse.mouse_moveRotate($event); property.click_notDetect()"
        @mousedown="property.click_Detect()" @mouseup="mapSlide.position_do(); mapSlide.rotate_do()"
        @touchmove="controlTouch.touch($event, 'doing'); property.click_notDetect();"
        @touchstart="controlTouch.touch($event, 'start'); property.click_Detect()"
        @touchend="mapSlide.position_do(); mapSlide.zoom_do(); mapSlide.rotate_do()"
        @wheel="controlMouse.mouse_zoom($event)"></div>
    <div id="box">
        <div id="map_content" draggable="false" :key="CurrentFloor">
            <Transition name="map" mode="out-in">
                <component :is="MapDataCurrent" @mounted="setMapData" />
            </Transition>
        </div>
    </div>
</template>