<template></template>
<script setup>
import { onMounted } from 'vue';
const emit = defineEmits(['mounted']);
onMounted(() => {
    emit('mounted');
});
</script>