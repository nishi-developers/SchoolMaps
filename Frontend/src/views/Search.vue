<template>
    <div class="background text" id="search">
        <p class="textTitle">マップ検索</p>
        <div class="searchBox">
            <label for="searchInput" class="searchIcon">
                <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
            </label>
            <input id="searchInput" type="text" class="searchInput" placeholder="検索" @input="doSearch()"
                v-model="searchWord" required>
            <label for="searchInput" class="searchXmark" :class="searchXmarkIsActive" @click="resetSearch()">
                <font-awesome-icon :icon="['fas', 'xmark']" />
            </label>
        </div>
        <div class="results">
            <div v-for="place, key in PlaceInfoList" :key="key" @click="move(place.floor, place.id)">
                <div v-if="place.isShow" class="place">
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
    </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

// 配列の整理
import PlaceInfo from '@/assets/PlaceInfo.json'
let PlaceInfoKeys = []
let PlaceInfoList = []
for (let floorId = 0; floorId < PlaceInfo.length; floorId++) {
    PlaceInfoKeys = Object.keys(PlaceInfo[floorId]).filter((key) => !key.includes("__"))
    for (let idNum = 0; idNum < PlaceInfoKeys.length; idNum++) {
        if (!PlaceInfoKeys[idNum].includes("__")) {
            PlaceInfoList.push({
                id: PlaceInfoKeys[idNum],
                floor: floorId,
                floorName: PlaceInfo[floorId].__FloorFullName__,
                name: PlaceInfo[floorId][PlaceInfoKeys[idNum]].name,
                desc: PlaceInfo[floorId][PlaceInfoKeys[idNum]].desc,
                place: PlaceInfo[floorId][PlaceInfoKeys[idNum]].place,
                isShow: true
            })
        }
    }
}

function move(floor, id) {
    router.push(`${floor}/${id}`)
}


const searchWord = ref('')

const searchXmarkIsActive = ref('')
function resetSearch() {
    searchXmarkIsActive.value = 'active'
    searchWord.value = ''
    doSearch()
    setTimeout(() => {
        searchXmarkIsActive.value = ''
    }, 150);
}

function doSearch() {
    // 検索ワードを処理しやすい形式に変換
    // 小文字で検索するために全て小文字に変換
    const searchList = searchWord.value.split(' ')
    for (let i = 0; i < searchList.length; i++) {
        if (searchList[i].split(":", 2).length == 2) {
            searchList[i] = searchList[i].split(":", 2)
        } else {
            searchList[i] = ["normal", searchList[i]]
        }
        searchList[i][1] = searchList[i][1].toLowerCase()
    }
    console.log(searchList);
    // 一旦全て非表示にする
    for (let i = 0; i < PlaceInfoList.length; i++) {
        PlaceInfoList[i].isShow = false
    }
    for (let i = 0; i < searchList.length; i++) {
        switch (searchList[i][0]) {
            case "normal":
                for (let j = 0; j < PlaceInfoList.length; j++) {
                    if ((PlaceInfoList[j].name != null && PlaceInfoList[j].name.toLowerCase().includes(searchList[i][1])) ||
                        (PlaceInfoList[j].floorName != null && PlaceInfoList[j].floorName.toLowerCase().includes(searchList[i][1])) ||
                        (PlaceInfoList[j].place != null && PlaceInfoList[j].place.toLowerCase().includes(searchList[i][1])) ||
                        (PlaceInfoList[j].desc != null && PlaceInfoList[j].desc.toLowerCase().includes(searchList[i][1]))) {
                        PlaceInfoList[j].isShow = true
                    }
                    console.log(searchList[i][1]);
                }
                break;
            case "name":
                for (let j = 0; j < PlaceInfoList.length; j++) {
                    if (PlaceInfoList[j].name != null && PlaceInfoList[j].name.toLowerCase().includes(searchList[i][1])) {
                        PlaceInfoList[j].isShow = true
                    }
                }
                break;
            case "floor":
                for (let j = 0; j < PlaceInfoList.length; j++) {
                    if (PlaceInfoList[j].floorName != null && PlaceInfoList[j].floorName.toLowerCase().includes(searchList[i][1])) {
                        PlaceInfoList[j].isShow = true
                    }
                }
                break;
            case "place":
                for (let j = 0; j < PlaceInfoList.length; j++) {
                    if (PlaceInfoList[j].place != null && PlaceInfoList[j].place.toLowerCase().includes(searchList[i][1])) {
                        PlaceInfoList[j].isShow = true
                    }
                }
                break;
            case "desc":
                for (let j = 0; j < PlaceInfoList.length; j++) {
                    if (PlaceInfoList[j].desc != null && PlaceInfoList[j].desc.toLowerCase().includes(searchList[i][1])) {
                        PlaceInfoList[j].isShow = true
                    }
                }
                break;
        }
    }
}

</script>
<style scoped>
p {
    color: var(--MainBodyColor);
}

.searchBox {
    --SearchBoxHeight: 40px;
    border: 1px solid var(--MainBodyColor);
    border-radius: 10px;
    height: var(--SearchBoxHeight);
    width: 100%;
    display: flex;
    box-sizing: border-box;
}

.searchBox:hover {
    border: 2px solid var(--MainBodyColor);
}

.searchIcon {
    height: 100%;
    width: var(--SearchBoxHeight);
    background-color: var(--SubBaseColor);
}

.searchIcon svg {
    height: 80%;
    width: 80%;
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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