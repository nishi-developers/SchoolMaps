<template>
  <div class="suggest" :class="{ 'active': queries?.includes(props.value) }" @click="click">{{ props.name }}</div>
</template>
<script setup lang="ts">
const props = defineProps<{
  name: string,
  value: string,
  query: string | null,
}>()
const emit = defineEmits<{
  (e: 'update-query', value: string): void
}>()

const search = useSearch()

const queries = computed(() => {
  if (!props.query) return []
  return search.normalize(props.query).split(' ')
})

function click() {
  let newQuery = ''
  if (queries.value.includes(props.value) && props.query != null) {
    // すでに含まれている場合は削除
    newQuery = search.normalize(props.query).split(' ').filter(v => v !== props.value).join(' ')
  } else {
    // 含まれていない場合は追加
    if (props.query) {
      newQuery = props.query + ' ' + props.value
    } else {
      newQuery = props.value
    }
  }
  emit('update-query', newQuery)
}
</script>