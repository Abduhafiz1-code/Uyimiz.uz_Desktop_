<script setup>
import { watch, onUnmounted } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  size: { type: String, default: 'max-w-lg' },
})
const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}

function onKey(e) {
  if (e.key === 'Escape') close()
}

watch(
  () => props.modelValue,
  (v) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = v ? 'hidden' : ''
    if (v) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  }
)
onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
        <div class="absolute inset-0 bg-neutral/60 backdrop-blur-sm" @click="close"></div>
        <div
          class="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-base-300 bg-base-100 shadow-lift animate-pop-in sm:rounded-3xl"
          :class="size"
        >
          <div class="sticky top-0 z-10 flex items-start gap-4 border-b border-base-200 bg-base-100/95 px-5 py-4 backdrop-blur sm:px-6">
            <div class="flex-1">
              <h3 v-if="title" class="text-lg font-extrabold tracking-tight">{{ title }}</h3>
              <p v-if="subtitle" class="mt-1 text-sm text-base-content/60">{{ subtitle }}</p>
            </div>
            <button class="btn btn-ghost btn-sm rounded-xl px-2" @click="close">
              <Icon name="x" :size="18" />
            </button>
          </div>
          <div class="px-5 py-5 sm:px-6"><slot /></div>
          <div v-if="$slots.footer" class="border-t border-base-200 px-5 py-4 sm:px-6">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
