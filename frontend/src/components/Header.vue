<template>
    <div id="header">
        <div id="title">
            <div @click="toTop()">
                <span id="mainTitle">西高マップ</span>
                <!-- <span id="version">(α版)</span> -->
            </div>
        </div>
        <div id="menu">
            <RouterLink to="/guide">使い方</RouterLink>
            <RouterLink to="/about">このサイトについて</RouterLink>
        </div>
    </div>
</template>
<script setup>
import router from '@/router';
import { useRoute } from 'vue-router';
const route = useRoute();

function toTop() {
    // mapページ以外の場合はmapページに遷移
    if (route.name != 'map') {
        router.push({ name: 'map' });
    }
}
</script>
<style scoped>
#header {
    background-color: var(--MainColor);
    /* position: fixed; */
    width: 100%;
    height: var(--HeaderHeight);
    position: relative;
    /* border-bottom: 1px solid var(--MainBodyColor); */
    font-weight: bold;
    box-sizing: border-box;
}

#title {
    margin-right: 20px;
    position: absolute;
    top: 50%;
    left: 0%;
    transform: translate(0%, -50%);
    margin: 0 10px;
    cursor: pointer;
}


#title #mainTitle {
    font-size: 1.5rem;
    color: var(--MainBodyColor);
    vertical-align: middle;
    /* margin-left: 300px; */
}

#title #version {
    font-size: 1.2rem;
    color: var(--AccentBodyColor);
    vertical-align: middle;
}

#menu {
    font-size: 1rem;
    position: absolute;
    top: 50%;
    right: 0%;
    transform: translate(0%, -50%);
    color: var(--MainBodyColor);
    /* margin-right: 300px; */
}

#menu a {
    margin: 0 10px;
    color: var(--MainBodyColor);
}
</style>