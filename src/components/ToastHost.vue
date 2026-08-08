<script setup>
import { useUiStore } from '@/stores/ui'
import Icon from './Icon.vue'
const ui = useUiStore()
const ICONS = { success: 'check', info: 'info', error: 'x', warning: 'info' }
const STYLES = {
  success: 'border-success/30 bg-success/10 text-success',
  info: 'border-info/30 bg-info/10 text-info',
  error: 'border-error/30 bg-error/10 text-error',
  warning: 'border-warning/30 bg-warning/10 text-warning',
}
</script>

<template>
  <div class="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex w-[92vw] max-w-sm -translate-x-1/2 flex-col gap-2">
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-3 scale-95"
      leave-active-class="transition duration-200 ease-in absolute w-full"
      leave-to-class="opacity-0 scale-95"
      move-class="transition duration-200"
    >
      <div
        v-for="t in ui.toasts"
        :key="t.id"
        class="pointer-events-auto flex items-start gap-3 rounded-2xl border bg-base-100 p-3.5 shadow-lift"
      >
        <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg border" :class="STYLES[t.type]">
          <Icon :name="ICONS[t.type] || 'info'" :size="15" :stroke="2.2" />
        </span>
        <p class="flex-1 pt-0.5 text-sm font-medium leading-snug">{{ t.message }}</p>
        <button class="opacity-40 transition hover:opacity-100" @click="ui.dismiss(t.id)">
          <Icon name="x" :size="15" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
