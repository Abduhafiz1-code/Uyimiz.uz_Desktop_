<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  seed: { type: [Number, String], default: 1 },
  ratio: { type: String, default: 'aspect-[4/3]' },
  rounded: { type: String, default: '' },
})

const loaded = ref(false)
const failed = ref(false)

watch(
  () => props.src,
  () => {
    loaded.value = false
    failed.value = false
  }
)

function onError(e) {
  if (failed.value) return
  failed.value = true
  e.target.src = `https://picsum.photos/seed/uyimiz${props.seed}/900/675`
}
</script>

<template>
  <div :class="['relative overflow-hidden bg-base-200', ratio, rounded]">
    <div v-if="!loaded" class="skeleton-img absolute inset-0"></div>
    <img
      :src="src"
      :alt="alt"
      loading="lazy"
      decoding="async"
      class="h-full w-full object-cover transition-all duration-700"
      :class="loaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'"
      @load="loaded = true"
      @error="onError"
    />
  </div>
</template>
