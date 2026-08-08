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
      :aria-label="$t('common.language')"
    >
      <Icon name="globe" :size="18" />
      <span class="text-xs font-bold tracking-wide">
        {{ ui.locales.find((l) => l.code === ui.locale)?.short }}
      </span>
      <Icon name="down" :size="14" class="opacity-50" />
    </div>
    <ul
      tabindex="0"
      class="dropdown-content z-[60] mt-2 w-52 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-lift"
    >
      <li class="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-base-content/40">
        {{ $t('common.language') }}
      </li>
      <li v-for="l in ui.locales" :key="l.code">
        <button
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-base-200"
          :class="ui.locale === l.code && 'bg-base-200'"
          @click="ui.setLocale(l.code)"
        >
          <span class="text-base">{{ l.flag }}</span>
          <span class="flex-1 text-left">{{ l.label }}</span>
          <Icon v-if="ui.locale === l.code" name="check" :size="16" class="text-primary" />
        </button>
      </li>
    </ul>
  </div>
</template>
