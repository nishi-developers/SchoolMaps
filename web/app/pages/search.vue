<template>
  <div>
    <div id="search" class="page">
      <h1>マップ検索</h1>
      <div class="searchBox">
        <label for="searchInput" class="searchIcon">
          <Icon name="material-symbols:search-rounded" />
        </label>
        <input id="searchInput" v-model="query" type="text" class="searchInput" placeholder="検索ワードを入力" required>
        <label for="searchInput" class="searchFunc" :class="[searchXmarkIsActive ? 'active' : '']"
          @click="resetSearch()">
          <Icon name="material-symbols:cancel-outline-rounded" />
        </label>
        <label class="searchFunc" @click="shareLink()">
          <Icon name="material-symbols:ios-share-rounded" />
        </label>
      </div>
      <div class="layerSelect">
        <!-- <div class="layer" v-for="layer in Layers.filter(l => l.place).reverse()" :key="layer.prefix"
        @click="searchLayer != layer.prefix ? searchLayer = layer.prefix : searchLayer = null;"
        :class="[searchLayer == layer.prefix ? 'selected' : '']">
        <span v-if="layer.switchable">{{ layer.name }}</span>
        <span v-el se>基本マップ</span>
      </div> -->
        <input id="isAndCheck" v-model="isAndSearch" type="checkbox">
        <label for="isAndChecl">AND検索</label>
        <div class="layer">
          <span>layer:shinkan80</span>
        </div>
        <div class="layer">
          <span>未実装</span>
        </div>
      </div>
      <div class="results">
        <div v-for="id, key in results" :key="key" class="place" @click="move(id)">
          <span class="name">{{$places.filter((place) => place.id === id)[0]!.name}}</span>
          <span class="position">
            <Icon name="material-symbols:location-on-rounded" />
            {{$floors.filter((floor) => floor.id === $places.filter((place) => place.id === id)[0]!.floor)[0]!.name}}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
useHead({ title: '検索' })
const { $floors, $places } = useNuxtApp();

const search = new Search()

function decodeUrl() {
  // URLの切り出しとデコードまで行う
  let isAndSearch = false
  if (route.query.and == "true") {
    isAndSearch = true
  }
  return {
    query: decodeURIComponent(route.query.q as string || '') || null,
    isAndSearch: isAndSearch,
  }
}

async function encodeUrl(query: string | null, isAndSearch: boolean) {
  // URLをエンコードして変更する
  let isAnd: string
  if (query == null) {
    query = ''
  }
  if (isAndSearch) {
    isAnd = "true"
  } else {
    isAnd = "false"
  }
  await navigateTo({
    name: 'search',
    query: {
      q: encodeURIComponent(query),
      and: isAnd,
    },
    replace: true,
  })
}

// 検索機能
const query = ref(decodeUrl().query)
const isAndSearch = ref(decodeUrl().isAndSearch)
const results = ref([] as Array<string>)
encodeUrl(query.value, isAndSearch.value) // 初期用

watch([query, isAndSearch], () => {
  // URLを変更
  if (query.value != decodeUrl().query || isAndSearch.value != decodeUrl().isAndSearch) {
    encodeUrl(query.value, isAndSearch.value)
  }
  // 検索
  results.value = search.search(query.value, isAndSearch.value)
}, { immediate: true })


// ページ遷移
async function move(id: string) {
  // let floor = PlaceInfo[id].floor
  // let layer = PlaceInfo[id].layer
  // let url = `/${floor}/${id}`
  // if (Layers.filter(alayer => alayer.prefix == layer)[0].switchable) {
  //   url += `?layer=${layer}`
  // }
  // await navigateTo(url)
  alert(`ID: ${id} の場所に移動します (実装未完了)`)
}

// xマーク
const searchXmarkIsActive = ref(false)
function resetSearch() {
  searchXmarkIsActive.value = true
  query.value = ''
  setTimeout(() => {
    searchXmarkIsActive.value = false
  }, 150);
}

// リンク共有
function shareLink() {
  try {
    navigator.share({ title: `西高マップ-検索「${query.value}」`, url: location.href })
  } catch {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(location.href)
      alert("リンクをコピーしました")
    } else {
      alert("リンクのコピー及び共有に対応していません")
    }
  }
}
</script>
<style scoped lang="scss">
p {
  color: var(--MainBodyColor);
}

.searchBox {
  --SearchBoxHeight: 40px;
  border-radius: 5px;
  height: var(--SearchBoxHeight);
  width: 100%;
  display: flex;
}

.searchIcon {
  height: 100%;
  font-size: 1.8rem;
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

.searchFunc .iconify {
  height: calc(var(--SearchBoxHeight)*.6);
  width: calc(var(--SearchBoxHeight)*.6);
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

.results .position .iconify {
  height: 1.2rem;
  width: 1.2rem;
  position: relative;
  top: 4px;
}
</style>