<template>
    <div class="background text" id="search">
        <p class="textTitle">マップ検索</p>
        <div class="searchBox">
            <label for="searchInput" class="searchIcon"><font-awesome-icon
                    :icon="['fas', 'magnifying-glass']" /></label>
            <input id="searchInput" type="text" class="searchInput" placeholder="検索" @input="doSearch()"
                v-model="searchWord" required>
            <font-awesome-icon @click="reserSearch()" :icon="['fas', 'xmark']" class="searchXmark" />
        </div>
        <p>スペースで区切ることでOR検索が可能<br>
            {文字列} → {文字列}を全場所から検索<br>
            name:{文字列} → 名前に{文字列}を含む場所を検索<br>
            floor:{文字列} → 階に{文字列}を含む場所を検索<br>
            place:{文字列} → 場所に{文字列}を含む場所を検索<br>
            desc:{文字列} → 説明に{文字列}を含む場所を検索</p>
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
                floorName: PlaceInfo[floorId].__FloorDisplayName__,
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


function reserSearch() {
    searchWord.value = ''
    doSearch()
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
    border: 1px solid var(--MainBodyColor);
    border-radius: 10px;
    height: 30px;
    width: 100%;
    display: flex;
}

.searchIcon {
    height: 100%;
    width: auto;
    font-size: 20px;
}

.searchInput {
    width: 90%;
    height: 100%;
    border: none;
}

.searchXmark {
    height: 100%;
    width: 10%;
}



.place {
    border: 1px solid var(--MainBodyColor);
    margin: 5px;
    padding: 5px;
    border-radius: 10px;
    cursor: pointer;
}

.position {
    margin: 0 5px 0 5px;
}

.name {
    font-size: 20px;
    font-weight: bold;
}
</style>