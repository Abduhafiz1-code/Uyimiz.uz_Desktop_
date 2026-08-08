<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { DISTRICTS, districtName } from '@/data/listings.js'
import Icon from './Icon.vue'

const props = defineProps({ hero: { type: Boolean, default: false } })
const router = useRouter()
const { locale } = useI18n()

const deal = ref('sale')
const q = ref('')
const rooms = ref('')
const price = ref('')

const DEALS = [
  { id: 'sale', label: 'deal.sale' },
  { id: 'rent', label: 'deal.rent' },
  { id: 'daily', label: 'deal.daily' },
]

const QUICK = ['chilonzor', 'yunusobod', 'mirzo-ulugbek']

function submit() {
  router.push({
    name: 'search',
    query: {
      deal: deal.value,
      q: q.value || undefined,
      rooms: rooms.value || undefined,
      priceMax: price.value || undefined,
    },
  })
}

function quick(d) {
  router.push({ name: 'search', query: { deal: deal.value, district: d } })
}
</script>

<template>
  <div
    class="card-soft w-full p-2.5 sm:p-3"
    :class="hero && 'shadow-lift'"
  >
    <!-- deal tabs -->
    <div class="mb-2.5 flex gap-1 rounded-xl bg-base-200 p-1">
      <button
        v-for="d in DEALS"
        :key="d.id"
        class="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition"
        :class="deal === d.id ? 'bg-base-100 text-primary shadow-soft' : 'text-base-content/60 hover:text-base-content'"
        @click="deal = d.id"
      >
        {{ $t(d.label) }}
      </button>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row">
      <div class="relative flex-[2]">
        <Icon name="pin" :size="17" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/35" />
        <input
          v-model="q"
          class="field pl-10"
          :placeholder="$t('home.searchPlaceholder')"
          list="districts-list"
          @keyup.enter="submit"
        />
        <datalist id="districts-list">
          <option v-for="d in DISTRICTS" :key="d.id" :value="districtName(d.id, locale)" />
        </datalist>
      </div>

      <select v-model="rooms" class="field flex-1 cursor-pointer">
        <option value="">{{ $t('home.roomsPlaceholder') }}</option>
        <option v-for="n in [1, 2, 3, 4]" :key="n" :value="n">
          {{ n === 4 ? '4+' : n }} {{ $t('search.rooms').toLowerCase() }}
        </option>
      </select>

      <input
        v-model="price"
        inputmode="numeric"
        class="field flex-1"
        :placeholder="$t('home.pricePlaceholder')"
        @keyup.enter="submit"
      />

      <button class="btn btn-primary shrink-0 rounded-xl px-6 shadow-soft" @click="submit">
        <Icon name="search" :size="17" :stroke="2.1" />
        <span>{{ $t('common.search') }}</span>
      </button>
    </div>

    <div class="mt-2.5 flex flex-wrap items-center gap-1.5 px-1">
      <span class="mr-1 text-[11px] font-bold uppercase tracking-wider text-base-content/35">
        {{ $t('home.quick') }}
      </span>
      <button
        v-for="d in QUICK"
        :key="d"
        class="pill border border-base-300 bg-base-100 transition hover:border-primary hover:text-primary"
        @click="quick(d)"
      >
        {{ districtName(d, locale) }}
      </button>
      <button
        class="pill border border-base-300 bg-base-100 transition hover:border-primary hover:text-primary"
        @click="router.push({ name: 'search', query: { deal, verified: '1' } })"
      >
        {{ $t('search.onlyVerified') }}
      </button>
    </div>
  </div>
</template>
