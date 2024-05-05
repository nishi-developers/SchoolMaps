<template>
    <div id="PropertyView" v-if="isShowPropertyView">
        name : {{ PlaceInfo[props.Floor][props.PlaceId].name }}<br>
        description : {{ PlaceInfo[props.Floor][props.PlaceId].desc }}<br>
        <font-awesome-icon id="xmark" @click="closePropertyView()" :icon="['fas', 'xmark']" />
    </div>

</template>
<script setup>
import { ref } from 'vue'
import PlaceInfo from '@/assets/PlaceInfo.json'

const isShowPropertyView = ref(true)
const props = defineProps(["Floor", "PlaceId"])
const emit = defineEmits(["hideProperty"])

function closePropertyView() {
    emit("hideProperty")
}
</script>
<style scoped>
#PropertyView {
    background-color: #e2e2e2;
    width: 100%;
    height: 50%;
    position: absolute;
    bottom: 0;
    z-index: 10;
    border-radius: 20px 20px 0 0;
}

#xmark {
    width: 1rem;
    height: 1rem;
    position: absolute;
    top: 20px;
    right: 20px;
    transform: translate(-50%, -50%);
}
</style>