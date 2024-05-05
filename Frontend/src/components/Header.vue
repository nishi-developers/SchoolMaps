<template>
    <div id="header">
        <div id="title">
            <RouterLink to="/">西高MAP</RouterLink>
        </div>
        <div id="menu">
            <RouterLink to="/guide">使い方</RouterLink>
            <RouterLink to="/about">このサイトについて</RouterLink>
        </div>
    </div>
</template>
<style scoped>
#header {
    background-color: #b8b8b8;
    /* position: fixed; */
    width: 100%;
    height: var(--header-height);
    position: relative;
}

#title {
    font-size: 2rem;
    margin-right: 20px;
    position: absolute;
    top: 50%;
    left: 0%;
    transform: translate(0%, -50%);
}

#title a {
    margin: 0 10px;
}

#menu {
    font-size: 1rem;
    position: absolute;
    top: 50%;
    right: 0%;
    transform: translate(0%, -50%);
}

#menu a {
    margin: 0 10px;
}
</style>