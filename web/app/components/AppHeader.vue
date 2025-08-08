<template>
    <div id="header">
        <div id="title">
            <nuxt-link to="/">
                <span id="mainTitle">西高マップ</span>
            </nuxt-link>
        </div>
        <div id="menu">
            <nuxt-link to="/guide">使い方</nuxt-link>
            <nuxt-link to="/about">このサイトについて</nuxt-link>
        </div>
    </div>
</template>
<style scoped lang="scss">
#header {
    background-color: var(--MainColor);
    width: 100%;
    height: var(--HeaderHeight);
    position: fixed;
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
}


#title #mainTitle {
    font-size: 1.5rem;
    color: var(--MainBodyColor);
    vertical-align: middle;
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
}

#menu a {
    margin: 0 10px;
    color: var(--MainBodyColor);
}
</style>