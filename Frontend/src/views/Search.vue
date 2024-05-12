<template>
    <div class="background">
        <p class="textTitle">マップ検索</p>
        <form class="searchBox" @submit.prevent="search()">
            <input type="text" class="searchInput" placeholder="検索" v-model="searchWord" required>
            <button class="searchButton">
                <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
            </button>
        </form>
    </div>
</template>
<script setup>
import { ref } from 'vue'

const searchWord = ref('')

function search() {
    console.log(searchWord.value);
}
</script>