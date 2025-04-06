<template>
  <div class="background text widthLimit" id="search">
    <p class="textTitle">マップ検索</p>
    <div class="searchBox">
      <label for="searchInput" class="searchIcon">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
      </label>
      <input id="searchInput" type="text" class="searchInput" placeholder="検索ワードを入力" v-model="searchWord" required>
      <label for="searchInput" class="searchFunc" :class="[searchXmarkIsActive ? 'active' : '']"
        @mousedown="resetSearch()" @touchstart="resetSearch()">
        <font-awesome-icon :icon="['fas', 'xmark']" />
      </label>
      <label class="searchFunc" @click="shareLink()">
        <font-awesome-icon :icon="['fas', 'share-from-square']" />
      </label>
    </div>
    <div class="layerSelect">
      <div class="layer" v-for="layer in Layers.filter(l => l.place).reverse()" :key="layer.prefix"
        @click="searchLayer != layer.prefix ? searchLayer = layer.prefix : searchLayer = null;"
        :class="[searchLayer == layer.prefix ? 'selected' : '']">
        <span v-if="layer.switchable">{{ layer.name }}</span>
        <span v-else>基本マップ</span>
      </div>
    </div>
    <div class="results">
      <div v-for="id, key in searchResultsId" :key="key" @click="move(id)" class="place">
        <span class="name">{{ PlaceInfo[id].name }}</span>
        <span class="position">
          <font-awesome-icon :icon="['fas', 'location-dot']" />
          {{ FloorInfo[PlaceInfo[id].floor].fullName }}
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import PlaceInfo from '@/assets/PlaceInfo.json'
import FloorInfo from '@/assets/FloorInfo.json'
import Layers from '@/assets/Layers.json'
import { ref, watch } from 'vue'
import router from '@/router';
import { onBeforeRouteLeave } from 'vue-router'

//idとwordsを紐付けた連想配列を作成
// 小文字で検索するために全て小文字に変換
let PlaceInfoWords = [{}, {}, {}, {}, {}, {}]
for (let key of Object.keys(PlaceInfo)) {
  // PlaceInfoWords[key] = normalize(PlaceInfo[key].words + " " + key + " " + PlaceInfo[key].name)
  PlaceInfoWords[0][key] = normalize(PlaceInfo[key].name)
  PlaceInfoWords[1][key] = normalize(PlaceInfo[key].words)
  PlaceInfoWords[2][key] = normalize(key)
  PlaceInfoWords[3][key] = normalize(PlaceInfo[key].desc)
  PlaceInfoWords[4][key] = normalize(FloorInfo[PlaceInfo[key].floor].fullName)
  PlaceInfoWords[5][key] = normalize(FloorInfo[PlaceInfo[key].floor].shortName)
}
// 検索機能について
// 基本的にsearchWordを変更すると検索が行われる
// URLからの場合も、searchWordを変更することで検索が行われる

// ブラウザバックへの対応
const popstateEvent = () => {
  // ブラウザバック時にURLから検索ワードを取得
  searchWord.value = decodeUrl()[0]
  searchLayer.value = decodeUrl()[1]
}
window.addEventListener('popstate', popstateEvent);
onBeforeRouteLeave((to, from, next) => {
  // 解除をしないと、他のページで誤作動する
  window.removeEventListener('popstate', popstateEvent);
  next()
})

function decodeUrl() {
  // URLの切り出しとデコードまで行う
  const params = new URLSearchParams(document.location.search);
  let layer = params.get("layer") ? params.get("layer") : null
  return [decodeURIComponent(location.pathname.slice(8)), layer]
}
function encodeUrl(word, layer) {
  // URLをエンコードして、変更まで行う
  let word_encoded = encodeURIComponent(word)
  let layer_encoded = layer ? `?layer=${layer}` : ''
  router.push(`${import.meta.env.BASE_URL}search/${word_encoded}${layer_encoded}`)
}

// 検索機能
const searchWord = ref(decodeUrl()[0])
const searchLayer = ref(decodeUrl()[1])
const searchResultsId = ref(new Set(Object.keys(PlaceInfo))) // ここでURLからの場合は検索結果を変更する
watch([searchWord, searchLayer], () => {
  // URLを変更
  if ([searchWord.value, searchLayer.value] != decodeUrl()) {
    encodeUrl(searchWord.value, searchLayer.value)
  }
  // 検索
  if (searchWord.value == '' && searchLayer.value == null) {
    searchResultsId.value = new Set(Object.keys(PlaceInfo))
  } else {
    searchResultsId.value = new Set()
    // 検索ワードを半角・全角スペースで分割
    let searchWords = normalize(searchWord.value).split(" ")
    // 検索ワードを含むものを検索
    for (let aPlaceInfoWords of PlaceInfoWords) {
      // PlaceInfoWordsの各要素に対して検索を行う
      for (let aSearchWords of searchWords) {
        // 検索ワードごとに検索を行い、検索結果を追加
        Object.keys(aPlaceInfoWords)
          .filter((key) => {
            if (aSearchWords) {
              return aPlaceInfoWords[key].includes(aSearchWords)
            } else {
              return true
            }
          })
          .filter((key) => {
            // レイヤーが指定されている場合は、レイヤーを確認する
            if (searchLayer.value) {
              return PlaceInfo[key].layer == searchLayer.value
            } else {
              return true
            }
          })
          .forEach((key) => searchResultsId.value.add(key))
      }
    }
  }
}, { immediate: true })


// ページ遷移
function move(id) {
  let floor = PlaceInfo[id].floor
  let layer = PlaceInfo[id].layer
  let url = `/${floor}/${id}`
  if (Layers.filter(alayer => alayer.prefix == layer)[0].switchable) {
    url += `?layer=${layer}`
  }
  router.push(url)
}

// xマーク
const searchXmarkIsActive = ref(false)
function resetSearch() {
  searchXmarkIsActive.value = true
  searchWord.value = ''
  setTimeout(() => {
    searchXmarkIsActive.value = false
  }, 150);
}

// リンク共有
function shareLink() {
  try {
    navigator.share({ title: `西高マップ-検索「${searchWord.value}」`, url: location.href })
  } catch (e) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(location.href)
      alert("リンクをコピーしました")
    } else {
      alert("リンクのコピー及び共有に対応していません")
    }
  }
}

// カタカナ->ひらがな変換
function kataToHira(str) {
  return str.replace(/[\u30a1-\u30f6]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) - 0x60);
  });
}

// 全角->半角変換
function zenToHan(str) {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
}

// 正規化(大文字->小文字、全角->半角、カタカナ->ひらがな、全角スペース->半角スペース)
function normalize(str) {
  return zenToHan(kataToHira(str)).toLowerCase().replace(/　/g, ' ');
}
</script>
<style scoped>
p {
  color: var(--MainBodyColor);
}

.searchBox {
  --SearchBoxHeight: 40px;
  border-radius: 5px;
  height: var(--SearchBoxHeight);
  width: 100%;
  display: flex;
  box-sizing: border-box;
}

.searchIcon {
  height: 100%;
  font-size: 1.5rem;
  width: var(--SearchBoxHeight);
  background-color: var(--SubBaseColor);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--MainBodyColor)
}

.searchInput {
  width: calc(100% - var(--SearchBoxHeight)*2);
  height: 100%;
  border: none;
  font-size: 1.4rem;
  padding: 1px 5px;
  color: var(--MainBodyColor);
  background-color: var(--SubBaseColor);
  border-radius: 0;
}

.searchFunc {
  height: 100%;
  width: var(--SearchBoxHeight);
  background-color: var(--SubBaseColor);
}

.searchFunc.active {
  background-color: var(--MainColor);
}

.searchFunc svg {
  height: calc(var(--SearchBoxHeight)*.5);
  width: calc(var(--SearchBoxHeight)*.5);
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--MainBodyColor)
}

.layerSelect {
  display: flex;
  margin-top: 10px;
}

.layer {
  width: 100px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.1rem;
  color: var(--MainBodyColor);
  cursor: pointer;
  background-color: var(--SubBaseColor);
  border-radius: 5px;
  margin-right: 10px;
  user-select: none;
}

.layer.selected {
  background-color: var(--SubColor);
}

#linkShare {
  cursor: pointer;
  margin-left: 10px;
  font-size: 1rem;
}


.place {
  border-bottom: 2px solid var(--MainColor);
  margin: 5px 0;
  padding: 5px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--MainBodyColor);
}

.place:hover {
  background-color: var(--SubBaseColor);
  border-radius: 5px;
}

.name {
  font-size: 20px;
}

.position {
  font-size: 15px;
}


.results {
  margin-top: 10px;
}
</style>