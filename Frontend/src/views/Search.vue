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
            <div v-for="id, key in searchResultsId" :key="key" @click="move(PlaceInfo[id].floor, id)" class="place">
                <p class="name">{{ PlaceInfo[id].name }}</p>
                <p>
                    <span class="position">
                        <font-awesome-icon :icon="['fas', 'location-dot']" />
                        {{ FloorInfo[PlaceInfo[id].floor].fullName }}
                    </span>
                </p>
                <!-- <p v-html="PlaceInfo[id].desc" v-if="PlaceInfo[id].desc != null"></p> -->
            </div>
        </div>
    </div>
</template>
<script setup>
import PlaceInfo from '@/assets/PlaceInfo.json'
import FloorInfo from '@/assets/FloorInfo.json'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

//idとwordsを紐付けた連想配列を作成
// 小文字で検索するために全て小文字に変換
let PlaceInfoWords = {}
for (let key of Object.keys(PlaceInfo)) {
    PlaceInfoWords[key] = (PlaceInfo[key].words + " " + key + " " + PlaceInfo[key].name).toLowerCase()
}

// ページ遷移
function move(floor, id) {
    router.push(`${floor}/${id}`)
}

// 検索機能
const searchWord = ref('')
const searchResultsId = ref(new Set(Object.keys(PlaceInfoWords)))
watch(searchWord, () => {
    if (searchWord.value == '') {
        searchResultsId.value = new Set(Object.keys(PlaceInfoWords))
    } else {
        searchResultsId.value = new Set()
        // 検索ワードを半角・全角スペースで分割
        let searchWords = searchWord.value.toLowerCase().split(/( |　)/)
        searchWords = searchWords.filter((value) => value != ' ' && value != '　' && value != '')
        // 検索ワードを含むものを検索
        for (let aSearchWords of searchWords) {
            Object.keys(PlaceInfoWords).filter((key) => PlaceInfoWords[key].includes(aSearchWords)).forEach((key) => searchResultsId.value.add(key))
        }
    }
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