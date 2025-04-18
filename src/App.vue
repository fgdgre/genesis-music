<script setup lang="ts">
import { ref } from "vue";
import { useFetchTracks } from "./composables/useFetchTracks";
import TrackList from "./components/TrackList.vue";
import TrackForm from "./components/TrackForm.vue";

const page = ref(1);

const { data, loading, error } = useFetchTracks({ page });
const modalOpen = ref(false);
</script>

<template>
  <TrackList :tracks="data?.data" />
  <div class="grid grid-cols-2 gap-4">
    <button v-if="page !== 1" class="col-start-1 bg-gray-500" @click="page--">
      -
    </button>
    <button
      v-if="page < data?.meta.totalPages"
      class="col-start-2 bg-gray-500"
      @click="page++"
    >
      +
    </button>
  </div>

  <TrackForm v-if="modalOpen" />
</template>
