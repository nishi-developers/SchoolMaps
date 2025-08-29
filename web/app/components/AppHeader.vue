<template>
    <div id="header">
        <div id="title">
            <nuxt-link v-if="route.name !== 'index'" to="/">
                <span id="mainTitle">西高マップ</span>
            </nuxt-link>
            <a v-else href="/" @click.prevent>
                <span id="mainTitle">西高マップ</span>
            </a>
        </div>
        <div id="menu">
            <nuxt-link to="/guide">使い方</nuxt-link>
            <nuxt-link to="/about">このサイトについて</nuxt-link>
        </div>
    </div>
</template>
<script setup lang="ts">
const route = useRoute();
</script>
<style scoped lang="scss">
#header {
    background-color: var(--MainColor);
    width: 100%;
    height: v-bind("$config.public.headerHeightPx + 'px'");
    position: fixed;
    font-weight: bold;

    #title {
        margin-right: 20px;
        position: absolute;
        top: 50%;
        left: 0%;
        transform: translate(0%, -50%);
        margin: 0 10px;

        #mainTitle {
            font-size: 1.5rem;
            color: var(--MainBodyColor);
            vertical-align: middle;
        }

        #version {
            font-size: 1.2rem;
            color: var(--AccentBodyColor);
            vertical-align: middle;
        }
    }

    #menu {
        font-size: 1rem;
        position: absolute;
        top: 50%;
        right: 0%;
        transform: translate(0%, -50%);
        color: var(--MainBodyColor);

        a {
            margin: 0 10px;
            color: var(--MainBodyColor);
        }
    }
}
</style>