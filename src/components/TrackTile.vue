<script setup lang="ts">
import type { Track } from "@/types";

defineProps<{
  track: Track;
}>();
</script>

<template>
  <div>
    {{ track }}
  </div>
</template>
