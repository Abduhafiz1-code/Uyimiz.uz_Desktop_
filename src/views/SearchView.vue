<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useListingsStore } from '@/stores/listings'
import { DISTRICTS, districtName, formatPrice } from '@/data/listings.js'
import ListingCard from '@/components/ListingCard.vue'
import Icon from '@/components/Icon.vue'

const store = useListingsStore()
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const f = store.filters
const mobileFilters = ref(false)

const DEALS = [
  { id: 'sale', label: 'deal.sale' },
  { id: 'rent', label: 'deal.rent' },
  { id: 'daily', label: 'deal.daily' },
]
const SORTS = [
  { id: 'new', label: 'search.sortNew' },
  { id: 'cheap', label: 'search.sortCheap' },
  { id: 'expensive', label: 'search.sortExpensive' },
  { id: 'area', label: 'search.sortArea' },
]
const TOGGLES = [
  { key: 'verified', label: 'search.onlyVerified' },
  { key: 'ownerOnly', label: 'search.onlyOwner' },
  { key: 'withAgent', label: 'search.withAgent' },
  { key: 'contractReady', label: 'search.contractReady' },
]
const EXTRAS = [
  { key: 'metro', label: 'search.metro' },
  { key: 'furnished', label: 'search.furnished' },
  { key: 'newBuilding', label: 'search.newBuilding' },
]

function applyQuery() {
  const q = route.query
  if (q.deal) f.deal = q.deal
  if (q.district) f.district = q.district
  if (q.q) f.q = q.q
  if (q.rooms) f.rooms = [Number(q.rooms)]
  if (q.priceMax) f.priceMax = Number(q.priceMax)
  if (q.verified) f.verified = true
}
onMounted(() => {
  applyQuery()
  // Filtr o'zgarmagan bo'lsa store'dagi watcher ishlamaydi —
  // shuning uchun birinchi yuklashni o'zimiz chaqiramiz.
  store.fetchList()
})
watch(() => route.query, applyQuery)

function setDeal(d) {
  f.deal = d
  router.replace({ query: { ...route.query, deal: d } })
}

function toggleRoom(n) {
  const i = f.rooms.indexOf(n)
  if (i === -1) f.rooms.push(n)
  else f.rooms.splice(i, 1)
}

const activeCount = computed(() => {
  let n = 0
  if (f.district) n++
  if (f.q) n++
  n += f.rooms.length
  if (f.priceMin != null) n++
  if (f.priceMax != null) n++
  if (f.areaMin != null) n++
  TOGGLES.concat(EXTRAS).forEach((x) => f[x.key] && n++)
  return n
})

const heading = computed(() =>
  f.district
    ? t('search.title', { district: districtName(f.district, locale.value), count: store.total })
    : t('search.titleAll', { count: store.total })
)

function reset() {
  store.resetFilters()
  router.replace({ query: { deal: f.deal } })
}

function pageTo(p) {
  store.page = Math.min(Math.max(1, p), store.pageCount)
  window.scrollTo({ top: 200, behavior: 'smooth' })
}

const pages = computed(() => {
  const c = store.pageCount
  const p = store.page
  const out = []
  for (let i = 1; i <= c; i++) {
    if (i === 1 || i === c || Math.abs(i - p) <= 1) out.push(i)
    else if (out[out.length - 1] !== '…') out.push('…')
  }
  return out
})

// karta uchun nuqtalar
const pins = computed(() =>
  store.paged.map((l) => ({
    id: l.id,
    x: ((l.lng - 69.13) / 0.22) * 100,
    y: 100 - ((l.lat - 41.18) / 0.16) * 100,
    label: formatPrice(l, locale.value).value,
  }))
)
const hovered = ref(null)
</script>

<template>
  <div class="container-x py-6 sm:py-8">
    <!-- top bar -->
    <div class="mb-5 flex flex-wrap items-center gap-2">
      <div class="flex gap-1 rounded-xl bg-base-200 p-1">
        <button
          v-for="d in DEALS"
          :key="d.id"
          class="rounded-lg px-3.5 py-2 text-sm font-semibold transition"
          :class="f.deal === d.id ? 'bg-base-100 text-primary shadow-soft' : 'text-base-content/60'"
          @click="setDeal(d.id)"
        >
          {{ $t(d.label) }}
        </button>
      </div>

      <div class="relative min-w-[190px] flex-1">
        <Icon name="search" :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/35" />
        <input v-model="f.q" class="field py-2.5 pl-10" :placeholder="$t('home.searchPlaceholder')" />
      </div>

      <button
        class="btn btn-outline btn-sm relative h-[42px] rounded-xl lg:hidden"
        @click="mobileFilters = !mobileFilters"
      >
        <Icon name="filter" :size="16" />{{ $t('common.filters') }}
        <span v-if="activeCount" class="badge badge-primary badge-sm">{{ activeCount }}</span>
      </button>

      <select v-model="store.sort" class="field h-[42px] w-auto cursor-pointer py-0 pr-8 text-sm">
        <option v-for="s in SORTS" :key="s.id" :value="s.id">{{ $t(s.label) }}</option>
      </select>

      <button
        class="btn btn-ghost btn-sm hidden h-[42px] rounded-xl xl:inline-flex"
        @click="store.showMap = !store.showMap"
      >
        <Icon :name="store.showMap ? 'list' : 'map'" :size="16" />
        {{ store.showMap ? $t('search.list') : $t('search.map') }}
      </button>
    </div>

    <div class="grid gap-6" :class="store.showMap ? 'xl:grid-cols-[260px_1fr_340px]' : 'lg:grid-cols-[260px_1fr]'">
      <!-- ══ FILTERS ══ -->
      <aside
        class="space-y-6 lg:sticky lg:top-24 lg:h-fit lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1"
        :class="mobileFilters ? 'block' : 'hidden lg:block'"
      >
        <div>
          <p class="label-x">{{ $t('search.district') }}</p>
          <select v-model="f.district" class="field cursor-pointer py-2.5">
            <option value="">{{ $t('common.all') }}</option>
            <option v-for="d in DISTRICTS" :key="d.id" :value="d.id">{{ districtName(d.id, locale) }}</option>
          </select>
        </div>

        <div>
          <p class="label-x">{{ f.deal === 'rent' ? $t('search.price') : $t('search.price') }}</p>
          <div class="flex items-center gap-2">
            <input v-model.number="f.priceMin" type="number" class="field py-2.5" :placeholder="$t('common.from')" />
            <span class="text-base-content/30">—</span>
            <input v-model.number="f.priceMax" type="number" class="field py-2.5" :placeholder="$t('common.to')" />
          </div>
        </div>

        <div>
          <p class="label-x">{{ $t('search.rooms') }}</p>
          <div class="flex gap-1.5">
            <button
              v-for="n in [1, 2, 3, 4]"
              :key="n"
              class="h-10 flex-1 rounded-xl border text-sm font-semibold transition"
              :class="
                f.rooms.includes(n)
                  ? 'border-primary bg-primary text-primary-content'
                  : 'border-base-300 hover:border-primary/50'
              "
              @click="toggleRoom(n)"
            >
              {{ n === 4 ? '4+' : n }}
            </button>
          </div>
        </div>

        <div>
          <p class="label-x">{{ $t('search.area') }}</p>
          <input v-model.number="f.areaMin" type="number" class="field py-2.5" :placeholder="$t('common.from')" />
        </div>

        <div>
          <p class="label-x">{{ $t('search.trust') }}</p>
          <div class="space-y-2.5">
            <label v-for="tg in TOGGLES" :key="tg.key" class="flex cursor-pointer items-center gap-2.5 text-sm">
              <input v-model="f[tg.key]" type="checkbox" class="checkbox checkbox-primary checkbox-sm rounded-md" />
              <span :class="tg.key === 'ownerOnly' && 'font-semibold text-primary'">{{ $t(tg.label) }}</span>
            </label>
          </div>
        </div>

        <div>
          <p class="label-x">{{ $t('search.extra') }}</p>
          <div class="space-y-2.5">
            <label v-for="tg in EXTRAS" :key="tg.key" class="flex cursor-pointer items-center gap-2.5 text-sm">
              <input v-model="f[tg.key]" type="checkbox" class="checkbox checkbox-primary checkbox-sm rounded-md" />
              {{ $t(tg.label) }}
            </label>
          </div>
        </div>

        <div class="flex gap-2 pb-2">
          <button class="btn btn-primary flex-1 rounded-xl" @click="mobileFilters = false">
            {{ $t('common.apply') }}
          </button>
          <button class="btn btn-ghost rounded-xl" @click="reset">{{ $t('common.reset') }}</button>
        </div>
      </aside>

      <!-- ══ RESULTS ══ -->
      <div>
        <div class="mb-4">
          <h1 class="text-xl font-extrabold tracking-tight sm:text-2xl">{{ heading }}</h1>
          <p class="mt-1 text-sm text-base-content/55">
            {{ $t('search.subtitle', { owners: store.ownerCount, agents: store.agentCount }) }}
          </p>
        </div>

        <div v-if="store.total" class="grid gap-5 sm:grid-cols-2" :class="store.showMap ? '' : 'lg:grid-cols-3'">
          <ListingCard v-for="l in store.paged" :key="l.id" :listing="l" />
        </div>

        <div v-else class="card-soft flex flex-col items-center px-6 py-16 text-center">
          <span class="grid h-14 w-14 place-items-center rounded-2xl bg-base-200 text-base-content/40">
            <Icon name="search" :size="24" />
          </span>
          <p class="mt-5 text-lg font-bold">{{ $t('common.noResults') }}</p>
          <p class="mt-1.5 max-w-xs text-sm text-base-content/55">{{ $t('common.noResultsHint') }}</p>
          <button class="btn btn-primary mt-6 rounded-xl" @click="reset">{{ $t('common.reset') }}</button>
        </div>

        <!-- pagination -->
        <div v-if="store.pageCount > 1" class="mt-8 flex items-center justify-center gap-1.5">
          <button class="btn btn-ghost btn-sm rounded-xl px-2.5" :disabled="store.page === 1" @click="pageTo(store.page - 1)">
            <Icon name="left" :size="16" />
          </button>
          <template v-for="(p, i) in pages" :key="i">
            <span v-if="p === '…'" class="px-1.5 text-base-content/40">…</span>
            <button
              v-else
              class="h-9 min-w-9 rounded-xl px-3 text-sm font-semibold transition"
              :class="p === store.page ? 'bg-primary text-primary-content' : 'hover:bg-base-200'"
              @click="pageTo(p)"
            >
              {{ p }}
            </button>
          </template>
          <button class="btn btn-ghost btn-sm rounded-xl px-2.5" :disabled="store.page === store.pageCount" @click="pageTo(store.page + 1)">
            <Icon name="right" :size="16" />
          </button>
        </div>
      </div>

      <!-- ══ MAP ══ -->
      <aside v-if="store.showMap" class="hidden xl:block">
        <div class="sticky top-24 h-[calc(100vh-8rem)] overflow-hidden rounded-3xl border border-base-300 bg-base-200">
          <div class="relative h-full w-full">
            <div class="bg-grid absolute inset-0 text-base-content/15"></div>
            <svg class="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 62 Q28 50 52 60 T100 48" fill="none" stroke="currentColor" stroke-width="1.4" class="text-primary/40" />
              <path d="M18 0 L26 100" fill="none" stroke="currentColor" stroke-width=".8" class="text-base-content/25" />
              <path d="M70 0 L62 100" fill="none" stroke="currentColor" stroke-width=".8" class="text-base-content/25" />
              <path d="M0 26 L100 32" fill="none" stroke="currentColor" stroke-width=".8" class="text-base-content/25" />
            </svg>

            <RouterLink
              v-for="p in pins"
              :key="p.id"
              :to="{ name: 'listing', params: { id: p.id } }"
              class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-soft transition hover:z-20 hover:scale-110"
              :class="hovered === p.id ? 'z-20 bg-primary text-primary-content' : 'bg-base-100'"
              :style="{ left: Math.min(92, Math.max(8, p.x)) + '%', top: Math.min(92, Math.max(6, p.y)) + '%' }"
              @mouseenter="hovered = p.id"
              @mouseleave="hovered = null"
            >
              {{ p.label }}
            </RouterLink>

            <div class="absolute bottom-4 left-4 right-4 rounded-2xl bg-base-100/90 p-3 text-xs text-base-content/60 backdrop-blur">
              <Icon name="info" :size="14" class="mr-1 inline" />
              {{ $t('footer.demo') }}
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
