<template>
    <div class="background" id="search">
        <p class="textTitle">マップ検索</p>
        <form class="searchBox" @submit.prevent="doSearch()">
            <input type="text" class="searchInput" placeholder="検索" v-model="searchWord" required>
            <button class="searchButton">
                <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
            </button>
        </form>
        <ul>
            <li v-for="place, key in PlaceInfoList" :key="key" @click="move(place.floor, place.id)" class="place">
                <p class="name">{{ place.name }}</p>
                <p>
                    <span class="position" v-if="place.floor != null">
                        <font-awesome-icon :icon="['fas', 'stairs']" />
                        {{ place.floor }}
                    </span>
                    <span class="position" v-if="place.place != null">
                        <font-awesome-icon id="locationIcon" :icon="['fas', 'location-dot']" />
                        {{ place.place }}
                    </span>
                </p>
                <p v-html="place.desc" v-if="place.desc != null"></p>
            </li>
        </ul>
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
                name: PlaceInfo[floorId][PlaceInfoKeys[idNum]].name,
                desc: PlaceInfo[floorId][PlaceInfoKeys[idNum]].desc,
                place: PlaceInfo[floorId][PlaceInfoKeys[idNum]].place
            })
        }
    }
}
console.log(PlaceInfoList);

function move(floor, id) {
    router.push(`${floor}/${id}`)
}


const searchWord = ref('')

function doSearch() {
    console.log(searchWord.value);
}


</script>
<style scoped>
#search {
    overflow: scroll;
}

.place {
    border: 1px solid black;
    margin: 5px;
    padding: 5px;
}

.position {
    margin: 0 5px 0 5px;
}
</style>