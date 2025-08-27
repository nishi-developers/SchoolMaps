<template>
  <div>
    <div class="page">
      <h1>Redirecting...</h1>
    </div>
  </div>
</template>
<script setup lang="ts">
const route = useRoute();
const search = useSearch();
const query = decodeURIComponent(route.query.q as string || '') || null;
const isAndSearch = route.query.and === "true" || false;
const result = search.search(query, isAndSearch)
navigateTo({
  name: 'index',
  query: {
    places: result.join(','),
  },
  replace: true
});
</script>