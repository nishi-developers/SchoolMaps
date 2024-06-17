<template></template>

<script setup>
const props = defineProps(["selectedID"])
const emit = defineEmits(["showProperty"])
function showProperty(id) {
    emit('showProperty', id)
}
</script>