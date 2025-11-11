<script setup lang="ts">
const route = useRoute();

const tracksStore = useTracksStore();
const { isLoading } = storeToRefs(tracksStore);
</script>

<template>
  <PureAppHeader :title="(route.meta.title as string)" :is-loading>
    <template #action>
      <div id="header-action"></div>
    </template>
  </PureAppHeader>
</template>
