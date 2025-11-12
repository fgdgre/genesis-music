<!-- AudioCore.vue -->
<script setup lang="ts">
/**
 * Props:
 *  - src: audio URL (or null to clear)
 *  - isPlaying: global play/pause state
 *  - currentTime: desired playback time (seconds)
 *  - volume: 0..1
 *  - muted: boolean
 *  - preload: 'none' | 'metadata' | 'auto' (default 'metadata')
 *
 * Emits:
 *  - 'update:currentTime' (number)  -> for store time sync
 *  - 'duration' (number)            -> total duration (sec)
 *  - 'ended' ()                     -> when track ends
 *  - 'error' (string)               -> when audio fails to load
 *  - 'canplay' ()                   -> when the element can start playback
 */

const props = withDefaults(
  defineProps<{
    src?: string | null;
    isPlaying: boolean;
    currentTime: number;
    volume?: number;
    muted?: boolean;
    preload?: "none" | "metadata" | "auto";
  }>(),
  {
    src: null,
    volume: 1,
    muted: false,
    preload: "metadata",
  }
);

const emit = defineEmits<{
  "update:currentTime": [number];
  duration: [number];
  ended: [];
  error: [string];
  canplay: [];
}>();

const el = ref<HTMLAudioElement | null>(null);

// --- helpers ---------------------------------------------------------------

/** tiny throttle so we don't spam the store on every paint */
let lastTimeEmit = 0;
function emitThrottledTime(t: number) {
  const now = performance.now();
  if (now - lastTimeEmit > 100) {
    lastTimeEmit = now;
    emit("update:currentTime", t);
  }
}

// --- DOM event handlers ----------------------------------------------------

function onTimeUpdate() {
  if (!el.value) return;
  emitThrottledTime(el.value.currentTime);
}

function onLoadedMetadata() {
  if (!el.value) return;
  const d = Number.isFinite(el.value.duration) ? el.value.duration : 0;
  emit("duration", d);

  // resume where the store says
  if (props.currentTime > 0) {
    try {
      el.value.currentTime = props.currentTime;
    } catch {}
  }
}

function onCanPlay() {
  emit("canplay");
  if (props.isPlaying) {
    el.value?.play().catch(() => {
      /* user gesture might be required; keep isPlaying true in store */
    });
  }
}

function onEnded() {
  emit("ended");
}

function onPause() {
  if (!el.value) return;
  emit("update:currentTime", el.value.currentTime);
}

function onError() {
  const m =
    el.value?.error?.message ??
    `Audio error (code ${el.value?.error?.code ?? "unknown"})`;
  emit("error", m);
}

// --- watchers: drive the element from store props -------------------------

// switch source without remounts
watch(
  () => props.src,
  (u) => {
    if (!el.value) return;
    if (!u) {
      el.value.removeAttribute("src");
      el.value.load(); // reset element state
      return;
    }
    if (el.value.src !== u) {
      el.value.src = u;
      // Use props.preload; let onCanPlay / onLoadedMetadata decide when to play/seek
      // Calling load() ensures a clean fetch even if the same URL repeats.
      try {
        el.value.load();
      } catch {}
    }
  },
  { immediate: true }
);

// play/pause
watch(
  () => props.isPlaying,
  (p) => {
    if (!el.value) return;
    if (p) {
      el.value.play().catch(() => {
        /* gesture issue; ignore */
      });
    } else {
      el.value.pause();
    }
  },
  { immediate: true }
);

// SEEK EVEN WHILE PLAYING (avoid jitter with a small epsilon)
watch(
  () => props.currentTime,
  (t) => {
    const a = el.value;
    if (!a) return;
    if (!Number.isFinite(t)) return;
    if (Math.abs(a.currentTime - t) > 0.15) {
      try {
        a.currentTime = t;
      } catch {}
    }
  },
  { immediate: false }
);

// volume & mute
watch(
  [() => props.volume, () => props.muted],
  ([v, m]) => {
    if (!el.value) return;
    el.value.volume = Math.min(1, Math.max(0, v ?? 1));
    el.value.muted = !!m;
  },
  { immediate: true }
);

onMounted(() => {
  if (!el.value) return;
  el.value.preload = props.preload;
  // If you need analyzers/CORS:
  // el.value.crossOrigin = 'anonymous'
});
</script>

<template>
  <audio
    ref="el"
    hidden
    @timeupdate="onTimeUpdate"
    @loadedmetadata="onLoadedMetadata"
    @canplay="onCanPlay"
    @ended="onEnded"
    @pause="onPause"
    @error="onError"
  />
</template>
