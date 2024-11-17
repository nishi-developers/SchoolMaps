<template>
    <div class="background text" id="search">
        <p class="textTitle">マップ検索</p>
        <div class="searchBox">
            <label for="searchInput" class="searchIcon">
                <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
            </label>
            <input id="searchInput" type="text" class="searchInput" placeholder="検索" v-model="searchWord" required>
            <label for="searchInput" class="searchXmark" :class="[searchXmarkIsActive ? 'active' : '']"
                @mousedown="resetSearch()" @touchstart="resetSearch()">
                <font-awesome-icon :icon="['fas', 'xmark']" />
            </label>
        </div>
        <div class="results">
            <div v-for="place, key in searchResults" :key="key" @click="move(place.floor, place.id)" class="place">
                <p class="name">{{ place.name }}</p>
                <p>
                    <span class="position" v-if="place.floorName != null">
                        <font-awesome-icon :icon="['fas', 'stairs']" />
                        {{ place.floorName }}
                    </span>
                    <span class="position" v-if="place.place != null">
                        <font-awesome-icon id="locationIcon" :icon="['fas', 'location-dot']" />
                        {{ place.place }}
                    </span>
                </p>
                <p v-html="place.desc" v-if="place.desc != null"></p>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

function move(floor, id) {
    router.push(`${floor}/${id}`)
}

// 配列の整理
import PlaceInfo from '@/assets/PlaceInfo.json'

//idとwordsを紐付けた連想配列を作成
// 小文字で検索するために全て小文字に変換
let PlaceInfoWords = {}
for (let key of Object.keys(PlaceInfo)) {
    PlaceInfoWords[key] = (PlaceInfo[key].words + " " + key + " " + PlaceInfo[key].name).toLowerCase()
}

// 検索機能
const searchWord = ref('')
// const searchResults = ref([])
let searchResultsId = new Set(Object.keys(PlaceInfoWords))
watch(searchWord, () => {
    if (searchWord.value == '') {
        searchResultsId = new Set(Object.keys(PlaceInfoWords))
    } else {
        searchResultsId = new Set()
        // 検索ワードを半角・全角スペースで分割
        let searchWords = searchWord.value.toLowerCase().split(/( |　)/)
        for (let aSearchWords of searchWords) {
            // 検索ワードを含むものを検索
            Object.keys(PlaceInfoWords).filter((key) => PlaceInfoWords[key].includes(aSearchWords)).forEach((key) => searchResultsId.add(key))
        }
    }
    // // 表示
    // for (let id of searchResultsId) {
    //     searchResults.value.push(PlaceInfo[id])
    // }
}, { immediate: true })


// xマーク
const searchXmarkIsActive = ref(false)
function resetSearch() {
    searchXmarkIsActive.value = true
    searchWord.value = ''
    setTimeout(() => {
        searchXmarkIsActive.value = false
    }, 150);
}
</script>
<style scoped>
p {
    color: var(--MainBodyColor);
}

.searchBox {
    --SearchBoxHeight: 40px;
    border: 2px solid var(--MainBodyColor);
    border-radius: 10px;
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
    background-color: var(--MainBaseColor);
}

.searchXmark {
    height: 100%;
    width: var(--SearchBoxHeight);
    background-color: var(--SubBaseColor);
}

.searchXmark.active {
    background-color: var(--MainColor);
}

.searchXmark svg {
    height: calc(var(--SearchBoxHeight)*.5);
    width: calc(var(--SearchBoxHeight)*.5);
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--MainBodyColor)
}



.place {
    border: 1px solid var(--MainBodyColor);
    margin: 5px 0;
    padding: 5px;
    border-radius: 10px;
    cursor: pointer;
}

.place:hover {
    background-color: var(--SubBaseColor);
}

.position {
    margin: 0 5px 0 5px;
}

.name {
    font-size: 20px;
    font-weight: bold;
}

.results {
    margin-top: 10px;
}
</style>