<script setup lang="ts">
import type { Track } from "@/types";
import TrackTile from "./TrackTile.vue";

defineProps<{
  tracks?: Track[];
}>();
</script>

<template>
  <TrackTile v-for="track in tracks" :track />
</template>
