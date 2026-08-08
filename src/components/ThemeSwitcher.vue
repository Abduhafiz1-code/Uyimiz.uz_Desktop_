<script setup>
import { useUiStore } from '@/stores/ui'
import Icon from './Icon.vue'

const ui = useUiStore()
</script>

<template>
  <div class="dropdown dropdown-end">
    <div
      tabindex="0"
      role="button"
      class="btn btn-ghost btn-sm gap-2 rounded-xl px-2.5"
      :aria-label="$t('common.theme')"
    >
      <Icon :name="ui.themes.find((t) => t.id === ui.theme)?.icon || 'sun'" :size="18" />
      <Icon name="down" :size="14" class="opacity-50" />
    </div>
    <ul
      tabindex="0"
      class="dropdown-content z-[60] mt-2 w-56 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-lift"
    >
      <li class="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-base-content/40">
        {{ $t('common.theme') }}
      </li>
      <li v-for="t in ui.themes" :key="t.id">
        <button
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-base-200"
          :class="ui.theme === t.id && 'bg-base-200'"
          @click="ui.setTheme(t.id)"
        >
          <span class="h-4 w-4 rounded-full ring-2 ring-base-300" :style="{ background: t.dot }"></span>
          <span class="flex-1 text-left">{{ $t('themes.' + t.id) }}</span>
          <Icon v-if="ui.theme === t.id" name="check" :size="16" class="text-primary" />
        </button>
      </li>
    </ul>
  </div>
</template>
