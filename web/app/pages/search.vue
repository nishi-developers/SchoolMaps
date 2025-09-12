<template>
  <div>
    <div id="search" class="page">
      <h1>マップ検索</h1>
      <div id="searchBox">
        <label id="searchIcon" for="searchInput">
          <Icon name="search" />
        </label>
        <input id="searchInput" v-model="query" type="text" placeholder="検索ワードを入力" required>
        <label for="searchInput" class="searchFunc" @click="query = ''">
          <Icon name="close" />
        </label>
        <label class="searchFunc" @click="shareLink(`西高マップ-検索「${query}」`, useRequestURL().href)">
          <Icon name="share" />
        </label>
        <NuxtLink class="searchFunc"
          :to="{ name: 'jump-map-search', query: { q: query, and: isAndSearch.toString() }, replace: false }">
          <Icon name="searchOnMap" />
        </NuxtLink>
      </div>
      <div id="modeSelect">
        <input id="isAndCheck" v-model="isAndSearch" type="checkbox" style="display: none;">
        <label id="isAndLabel" for="isAndCheck">
          <span :class="{ active: !isAndSearch }">OR</span>
          <span :class="{ active: isAndSearch }">AND</span>
        </label>
        <div id="suggests">
          <SearchSuggest v-for="suggest, i in suggests" :key="i" :name="suggest.name" :value="suggest.value"
            :query="query" @update-query="(value) => { query = value }" />
        </div>
      </div>
      <div id="results">
        <NuxtLink v-for="id, key in results" :key="key" class="place" :to="{ name: 'index', query: { places: id } }">
          <span class="name">{{ placeName(id) }}</span>
          <span v-if="modeName(id)" class="mode">
            <Icon name="tag" />
            {{ modeName(id) }}
          </span>
          <span v-if="floorName(id)" class="position">
            <Icon name="stairs" />
            {{ floorName(id) }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
useHead({ title: '検索' })
const { $modesChangeable, $modesEnable, $floors, $floorsChangeable, $placesEnable } = useNuxtApp();

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

// 場所名、モード名、フロア名を取得する関数
const placeName = (id: string) => $placesEnable.value.filter((place) => place.id === id)[0]?.name || '不明な場所'
const modeName = (id: string) => $modesEnable.value.filter((mode) => mode.id === $placesEnable.value.filter((place) => place.id === id)[0]?.mode)[0]?.name
const floorName = (id: string) => $floors.value.filter((floor) => floor.id === $placesEnable.value.filter((place) => place.id === id)[0]?.floor)[0]?.name

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
#search {
  #searchBox {
    --SearchBoxHeight: 40px;
    border-radius: 10px;
    height: var(--SearchBoxHeight);
    width: 100%;
    display: flex;
    background-color: var(--SubBaseColor);
    padding: 0 5px;

    #searchInput {
      flex: 1;
      min-width: 0;
      height: 100%;
      border: none;
      font-size: 1.4rem;
      padding: 1px 5px;
      color: var(--MainBodyColor);
      background-color: var(--SubBaseColor);
      border-radius: 0;
    }

    #searchIcon,
    .searchFunc {
      height: 100%;
      width: var(--SearchBoxHeight);
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--MainBodyColor)
    }

    #searchIcon {
      cursor: default;
      font-size: 1.8rem;
    }

    .searchFunc {
      cursor: pointer;
      font-size: 1.6rem;
      border-radius: 5px;
      transition: var(--HoverTransition);

      @media (hover: hover) {
        &:hover {
          background-color: var(--SubColor);
        }
      }

      &:active {
        background-color: var(--SubColor);
      }
    }
  }

  #modeSelect {
    margin-top: 10px;
    width: 100%;
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    color: var(--MainBodyColor);
    gap: 15px;

    #isAndLabel {
      user-select: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      background-color: var(--SubBaseColor);

      span {
        width: 50%;
        padding: 3px 8px;
        text-align: center;
        border-radius: 10px;
        display: flex;
        justify-content: center;

        &.active {
          background-color: var(--SubColor);
        }

        &.inactive {
          background-color: var(--SubBaseColor);
        }
      }
    }
  }

  #suggests {
    flex: 1;
    display: flex;
    gap: 10px;
    margin-left: 10px;
    overflow-x: auto;
    white-space: nowrap;

    .suggest {
      cursor: pointer;
      text-decoration: underline;

      &.active {
        font-weight: bold;
      }
    }
  }

  #results {
    width: 100%;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;

    .place {
      display: block;
      width: 100%;
      // 両端5pxのボーダーを透明にする
      border-bottom: 2px solid var(--MainColor);
      border-image: linear-gradient(to right,
          transparent 5px,
          var(--MainColor) 5px,
          var(--MainColor) calc(100% - 5px),
          transparent calc(100% - 5px)) 1;
      padding: 5px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--MainBodyColor);
      text-decoration: none;
      gap: 10px;
      white-space: nowrap;
      border-radius: 5px;
      transition: var(--HoverTransition);

      @media (hover: hover) {
        &:hover {
          background-color: var(--SubBaseColor);
        }
      }

      &:active {
        background-color: var(--SubBaseColor);
      }

      .name {
        font-size: 1.25rem;
        flex: 1;
        overflow: hidden;
      }

      .mode,
      .position {
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 2px;
      }
    }
  }
}
</style>