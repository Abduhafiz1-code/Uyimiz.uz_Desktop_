<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useListingsStore } from '@/stores/listings'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { photo, districtName, formatPrice } from '@/data/listings.js'
import ListingCard from '@/components/ListingCard.vue'
import SmartImage from '@/components/SmartImage.vue'
import ChatModal from '@/components/ChatModal.vue'
import ContractModal from '@/components/ContractModal.vue'
import Icon from '@/components/Icon.vue'

const route = useRoute()
const router = useRouter()
const store = useListingsStore()
const ui = useUiStore()
const auth = useAuthStore()
const { t, locale } = useI18n()

// E'lon backenddan yuklanadi. Keshda bo'lsa darhol ko'rinadi,
// aks holda skelet ko'rsatiladi.
const l = ref(store.byId(route.params.id))
const loading = ref(!l.value)
const loadError = ref('')
const similarItems = ref([])
const idx = ref(0)

async function load(id) {
  idx.value = 0
  loadError.value = ''
  const cached = store.byId(id)
  l.value = cached
  loading.value = !cached
  try {
    const fresh = await store.fetchOne(id)
    if (String(route.params.id) !== String(id)) return
    l.value = fresh
    if (!fresh) loadError.value = t('common.notFound')
    else similarItems.value = await store.similar(fresh)
  } catch (e) {
    if (String(route.params.id) !== String(id)) return
    loadError.value = e.message || t('common.notFound')
  } finally {
    if (String(route.params.id) === String(id)) loading.value = false
  }
}

load(route.params.id)
watch(() => route.params.id, (id) => load(id))

const price = computed(() => (l.value ? formatPrice(l.value, locale.value) : null))
const district = computed(() => (l.value ? districtName(l.value.district, locale.value) : ''))
const agent = computed(() => (l.value?.agentId ? store.agents.find((a) => a.id === l.value.agentId) : null))
const fav = computed(() => (l.value ? store.isFav(l.value.id) : false))

const chat = ref(false)
const contract = ref(false)
const phoneShown = ref(false)

const FEATURE_ICONS = {
  metro: 'pin', furnished: 'bed', parking: 'car', lift: 'lift',
  balcony: 'balcony', ac: 'snow', school: 'school', pets: 'paw',
}

function needAuth(cb) {
  if (!auth.isAuthed) {
    ui.loginOpen = true
    ui.toast(t('auth.needLogin'), 'info')
    return
  }
  cb()
}

async function toggleFav() {
  if (!auth.isAuthed) {
    ui.loginOpen = true
    ui.toast(t('auth.needLogin'), 'info')
    return
  }
  try {
    const added = await store.toggleFav(l.value.id)
    ui.toast(added ? t('card.addFav') : t('card.removeFav'), added ? 'success' : 'info')
  } catch (e) {
    ui.toast(e.message || 'Xatolik', 'error')
  }
}

function share() {
  const url = window.location.href
  if (navigator.share) navigator.share({ title: 'Uyimiz.uz', url }).catch(() => {})
  else {
    navigator.clipboard?.writeText(url)
    ui.toast(t('common.copied'))
  }
}
</script>

<template>
  <div v-if="l" class="container-x py-6 sm:py-8">
    <!-- breadcrumb -->
    <div class="mb-4 flex items-center gap-2 text-sm text-base-content/50">
      <button class="flex items-center gap-1 hover:text-primary" @click="router.back()">
        <Icon name="left" :size="15" />{{ $t('common.back') }}
      </button>
      <span>/</span>
      <RouterLink :to="{ name: 'search', query: { district: l.district } }" class="hover:text-primary">
        {{ district }}
      </RouterLink>
    </div>

    <!-- gallery -->
    <div class="grid gap-2.5 lg:grid-cols-[1.6fr_1fr]">
      <SmartImage
        :src="photo(l.photos[idx], 1400)"
        :seed="l.id + idx"
        ratio="aspect-[16/10]"
        rounded="rounded-3xl"
      />
      <div class="grid grid-cols-2 gap-2.5">
        <button
          v-for="(p, i) in l.photos.slice(0, 4)"
          :key="i"
          class="relative overflow-hidden rounded-2xl transition hover:opacity-90"
          @click="idx = i"
        >
          <SmartImage :src="photo(p, 500)" :seed="p" ratio="aspect-[4/3]" />
          <span
            v-if="i === 3 && l.photos.length > 4"
            class="absolute inset-0 grid place-items-center bg-neutral/55 text-sm font-bold text-neutral-content"
          >
            +{{ l.photos.length - 4 }}
          </span>
          <span v-if="i === idx" class="absolute inset-0 rounded-2xl ring-2 ring-primary ring-inset"></span>
        </button>
      </div>
    </div>

    <div class="mt-7 grid gap-8 lg:grid-cols-[1fr_360px]">
      <!-- ══ MAIN ══ -->
      <div>
        <div class="flex flex-wrap gap-1.5">
          <span v-if="l.promoted" class="pill bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950">
            <Icon name="star" :size="12" :filled="true" />{{ $t('card.top') }}
          </span>
          <span v-if="l.verified" class="pill bg-primary/10 text-primary">
            <Icon name="badge" :size="13" :stroke="2.1" />{{ $t('card.verified') }}
          </span>
          <span v-if="!l.byAgent" class="pill bg-base-200">{{ $t('card.noAgent') }}</span>
          <span v-else class="pill bg-accent/15 text-accent">{{ $t('card.agent') }}</span>
          <span v-if="l.contractReady" class="pill bg-success/10 text-success">
            <Icon name="doc" :size="12" />{{ $t('card.contract') }}
          </span>
        </div>

        <div class="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
          <h1 class="text-3xl font-extrabold tracking-tight sm:text-[2.5rem]">{{ price.value }}</h1>
          <span v-if="price.suffix" class="pb-1 text-lg font-bold text-base-content/60">{{ price.suffix }}</span>
          <span v-if="l.deal === 'rent'" class="pb-1.5 text-base text-base-content/50">{{ $t('card.perMonth') }}</span>
          <span v-if="l.deal === 'daily'" class="pb-1.5 text-base text-base-content/50">{{ $t('card.perDay') }}</span>
        </div>

        <p class="mt-2 text-base font-semibold">
          {{ $t('card.rooms', { n: l.rooms }) }} · {{ district }}, {{ l.address }}
        </p>
        <p class="mt-1 font-mono text-xs text-base-content/45">
          {{ $t('listing.id') }} {{ l.id }} · {{ $t('listing.updated', { t: l.updatedH + ' ' + $t('time.hour') }) }} ·
          {{ $t('listing.views', { n: l.views }) }}
        </p>

        <!-- key facts -->
        <div class="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-base-300 bg-base-300 sm:grid-cols-5">
          <div v-for="(k, i) in [
            { l: 'listing.area', v: l.area + ' m²' },
            { l: 'listing.floor', v: l.floor + ' / ' + l.floors },
            { l: 'listing.built', v: l.year },
            { l: 'listing.repair', v: $t('repair.' + l.repair) },
            { l: 'listing.docs', v: $t('docs.' + l.docs) },
          ]" :key="i" class="bg-base-100 p-4">
            <p class="text-[11px] uppercase tracking-wide text-base-content/45">{{ $t(k.l) }}</p>
            <p class="mt-1 text-sm font-bold">{{ k.v }}</p>
          </div>
        </div>

        <!-- description -->
        <section class="mt-8">
          <h2 class="h3">{{ $t('listing.description') }}</h2>
          <p class="mt-3 max-w-2xl leading-relaxed text-base-content/70">
            {{ l.description || $t('listing.noDescription') }}
          </p>
        </section>

        <!-- features -->
        <section v-if="l.features?.length" class="mt-8">
          <h2 class="h3">{{ $t('listing.features') }}</h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="ft in l.features"
              :key="ft"
              class="flex items-center gap-2 rounded-xl border border-base-300 px-3.5 py-2.5 text-sm"
            >
              <Icon :name="FEATURE_ICONS[ft] || 'check'" :size="16" class="text-primary" />
              {{ $t('feature.' + ft) }}
            </span>
          </div>
        </section>

        <!-- location -->
        <section class="mt-8">
          <h2 class="h3">{{ $t('listing.location') }}</h2>
          <div class="relative mt-3 h-64 overflow-hidden rounded-3xl border border-base-300 bg-base-200">
            <div class="bg-grid absolute inset-0 text-base-content/15"></div>
            <svg class="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 60 Q30 48 55 58 T100 46" fill="none" stroke="currentColor" stroke-width="1.4" class="text-primary/40" />
              <path d="M22 0 L30 100" fill="none" stroke="currentColor" stroke-width=".8" class="text-base-content/25" />
            </svg>
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span class="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-content shadow-lift">
                <Icon name="pin" :size="20" />
              </span>
              <p class="mt-2 rounded-lg bg-base-100/90 px-2.5 py-1 text-xs font-bold backdrop-blur">
                {{ district }}, {{ l.address }}
              </p>
            </div>
          </div>
        </section>

        <!-- similar -->
        <section class="mt-10">
          <h2 class="h3 mb-4">{{ $t('listing.similar') }}</h2>
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ListingCard v-for="s in similarItems" :key="s.id" :listing="s" />
          </div>
        </section>
      </div>

      <!-- ══ SIDEBAR ══ -->
      <aside class="space-y-4 lg:sticky lg:top-24 lg:h-fit">
        <div class="card-soft p-5">
          <div class="flex items-center gap-3">
            <span class="grid h-11 w-11 place-items-center rounded-2xl bg-base-200">
              <Icon name="user" :size="20" />
            </span>
            <div class="min-w-0">
              <p class="flex items-center gap-1.5 truncate font-bold">
                {{ l.owner }}
                <Icon v-if="l.verified" name="badge" :size="15" class="shrink-0 text-primary" />
              </p>
              <p class="flex items-center gap-1.5 truncate text-xs text-base-content/55">
                {{ $t('listing.since', { n: l.ownerAds, y: l.ownerSince }) }}
                <span v-if="l.rating" class="flex shrink-0 items-center gap-0.5 font-bold text-amber-500">
                  <Icon name="star" :size="11" filled />{{ l.rating.toFixed(1) }}
                  <span class="font-normal text-base-content/40">({{ l.ratingCount }})</span>
                </span>
              </p>
            </div>
          </div>

          <div class="mt-4 space-y-2">
            <button class="btn btn-primary w-full rounded-xl" @click="needAuth(() => (chat = true))">
              <Icon name="chat" :size="17" />{{ $t('listing.writeOwner') }}
            </button>
            <button class="btn btn-outline w-full rounded-xl" @click="needAuth(() => (phoneShown = true))">
              <Icon name="phone" :size="17" />
              <span v-if="!phoneShown">{{ $t('listing.showPhone') }}</span>
              <span v-else class="font-mono">+998 90 {{ String(l.id).slice(0, 3) }} {{ String(l.id).slice(2, 4) }} {{ String(l.id).slice(1, 3) }}</span>
            </button>
            <button class="btn btn-ghost w-full rounded-xl" @click="needAuth(() => (contract = true))">
              <Icon name="doc" :size="17" />{{ $t('listing.makeContract') }}
            </button>
          </div>

          <div class="mt-4 flex gap-2 border-t border-base-200 pt-4">
            <button
              class="btn btn-ghost btn-sm flex-1 rounded-xl"
              :class="fav && 'text-error'"
              @click="toggleFav"
            >
              <Icon name="heart" :size="16" :filled="fav" />{{ $t(fav ? 'card.removeFav' : 'card.addFav') }}
            </button>
            <button class="btn btn-ghost btn-sm rounded-xl px-3" @click="share">
              <Icon name="share" :size="16" />
            </button>
          </div>
        </div>

        <!-- safety -->
        <div class="rounded-2xl border border-success/25 bg-success/[0.07] p-4">
          <p class="flex items-center gap-2 text-sm font-bold text-success">
            <Icon name="shield" :size="16" />{{ $t('listing.safety') }}
          </p>
          <p class="mt-2 text-xs leading-relaxed text-base-content/65">{{ $t('listing.safetyText') }}</p>
        </div>

        <!-- agent offer -->
        <div v-if="agent" class="card-soft p-4">
          <p class="text-xs text-base-content/55">{{ $t('listing.needAgent') }}</p>
          <div class="mt-3 flex items-center gap-3">
            <SmartImage :src="photo(agent.ph, 200)" :seed="'ag' + agent.id" ratio="aspect-square" rounded="rounded-xl w-11 shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold">{{ agent.name }}</p>
              <p class="flex items-center gap-1 text-xs text-accent">
                <Icon name="star" :size="12" filled />{{ agent.rating }}
                <span class="text-base-content/45">· {{ districtName(agent.district, locale) }}</span>
              </p>
            </div>
            <button class="btn btn-sm rounded-xl border-none bg-accent text-accent-content hover:bg-accent/90" @click="needAuth(() => (chat = true))">
              {{ $t('listing.agentCta') }}
            </button>
          </div>
        </div>

        <button
          class="flex w-full items-center justify-center gap-2 py-2 text-xs text-base-content/45 transition hover:text-error"
          @click="ui.toast($t('listing.reported'), 'info')"
        >
          <Icon name="flag" :size="14" />{{ $t('listing.report') }}
        </button>
      </aside>
    </div>

    <ChatModal v-model="chat" :name="agent ? agent.name : l.owner" :listing-id="l.id" />
    <ContractModal v-model="contract" :listing="l" />
  </div>

  <div v-else-if="loading" class="container-x py-8">
    <div class="skeleton-img h-80 w-full rounded-3xl"></div>
    <div class="mt-6 grid gap-3">
      <div class="skeleton-img h-8 w-2/3 rounded-xl"></div>
      <div class="skeleton-img h-5 w-1/3 rounded-xl"></div>
      <div class="skeleton-img h-24 w-full rounded-xl"></div>
    </div>
  </div>

  <div v-else class="container-x flex flex-col items-center py-24 text-center">
    <span class="grid h-16 w-16 place-items-center rounded-3xl bg-base-200 text-base-content/40">
      <Icon name="home" :size="28" />
    </span>
    <p class="mt-6 text-xl font-bold">{{ loadError || $t('listing.notFound') }}</p>
    <RouterLink to="/search" class="btn btn-primary mt-6 rounded-xl">{{ $t('fav.goSearch') }}</RouterLink>
  </div>
</template>
