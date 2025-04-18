<script setup lang="ts">
import { ref } from "vue";
import { useFetchTracks } from "./composables/useFetchTracks";
import TrackList from "./components/TrackList.vue";

const page = ref(1);

const { data, loading, error } = useFetchTracks({ page });
</script>

<template>
  <TrackList :tracks="data?.data" />
  <!-- <div class="grid grid-cols-2"> -->
  <button v-if="page < data?.meta.totalPages" @click="page++">+</button>
  <button v-if="page !== 1" @click="page++">-</button>
  <!-- </div> -->
</template>
