<script setup lang="ts">
import type { Track } from "@/types";
import AppModal from "./AppModal.vue";
import TrackForm from "./TrackForm.vue";

defineEmits<{
  submit: [Track];
  discard: [];
}>();
</script>

<template>
  <AppModal title="Create track">
    <TrackForm
      @submit="(track) => $emit('submit', track)"
      @discard="$emit('discard')"
    />
  </AppModal>
</template>
