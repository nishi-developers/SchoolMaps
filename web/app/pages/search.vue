<template>
  <div>
    <div id="search" class="page">
      <h1>マップ検索</h1>
      <div class="searchBox">
        <label for="searchInput" class="searchIcon">
          <Icon name="search" />
        </label>
        <input id="searchInput" v-model="query" type="text" class="searchInput" placeholder="検索ワードを入力" required>
        <label for="searchInput" class="searchFunc" @click="query = ''">
          <Icon name="close" />
        </label>
        <label class="searchFunc" @click="shareLink(`西高マップ-検索「${query}」`, requestURL.href)">
          <Icon name="share" />
        </label>
        <NuxtLink :to="{ name: 'jump-map-search', query: { q: query, and: isAndSearch.toString() }, replace: false }">
          <label class="searchFunc">
            <Icon name="search" />
          </label>
        </NuxtLink>
      </div>
      <div class="layerSelect">
        <input id="isAndCheck" v-model="isAndSearch" type="checkbox">
        <label for="isAndCheck">AND検索</label>
        <div id="suggests">
          <SearchSuggest v-for="suggest, i in suggests" :key="i" :name="suggest.name" :value="suggest.value"
            :query="query" @update-query="(value) => { query = value }" />
        </div>
      </div>
      <div class="results">
        <NuxtLink v-for="id, key in results" :key="key" class="place" :to="{ name: 'index', query: { places: id } }">
          <span class="name">{{$placesEnable.filter((place) => place.id === id)[0]?.name}}</span>
          <span class="position">
            <Icon name="location" />
            {{$floors.filter((floor) => floor.id === $placesEnable.filter((place) => place.id ===
              id)[0]?.floor)[0]?.name}}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
const requestURL = useRequestURL()
useHead({ title: '検索' })
const { $modesChangeable, $floors, $floorsChangeable, $placesEnable } = useNuxtApp();

const search = useSearch()

// suggestsの自動生成
const suggests = ref([]) as Ref<Array<{ name: string, value: string }>>
$modesChangeable.value.map((mode) => {
  suggests.value.push({ name: mode.name, value: `mode:${mode.id}` })
})
$floorsChangeable.value.map((floor) => {
  suggests.value.push({ name: floor.name, value: `floor:${floor.id}` })
})

function decodeUrl() {
  // URLの切り出しとデコードまで行う
  return {
    query: decodeURIComponent(route.query.q as string || '') || null,
    isAndSearch: route.query.and === "true" || false,
  }
}

async function encodeUrl(query: string | null, isAndSearch: boolean) {
  // URLをエンコードして変更する
  await navigateTo({
    name: 'search',
    query: {
      q: encodeURIComponent(query || ''),
      and: isAndSearch ? "true" : "false",
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

</script>
<style scoped lang="scss">
p {
  color: var(--MainBodyColor);
}


// 検索結果表示マップへのジャンプ用の仮CSS
a {
  text-decoration: none;
  color: inherit;
  width: 20px;
  position: relative;
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

// .searchFunc.active {
//   background-color: var(--MainColor);
// }

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
  display: block;
  width: 100%;
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