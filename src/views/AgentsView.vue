<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useListingsStore } from '@/stores/listings'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { districtName, DISTRICTS } from '@/data/listings.js'
import ChatModal from '@/components/ChatModal.vue'
import Icon from '@/components/Icon.vue'

/**
 * Agentlar sahifasi.
 *
 * Ma'lumot manbai — backenddagi `/api/agents` (faqat admin TASDIQLAGAN,
 * faol agentlar). Ilgari bu ro'yxat `data/listings.js` ichidagi qo'lda
 * yozilgan massivdan olinardi, shuning uchun haqiqiy agentlar ko'rinmasdi.
 */

/** Agent bo'lmoqchi bo'lganlar shu portalda ariza topshiradi. */
const AGENT_PORTAL_URL = 'https://uyimiz-uz-biznes.vercel.app/'

const store = useListingsStore()
const ui = useUiStore()
const auth = useAuthStore()
const { locale, t } = useI18n()

const sort = ref('rating')
const district = ref('')
const chat = ref(false)
const active = ref(null)

const list = computed(() => store.agents)
const loading = computed(() => store.agentsLoading)
const error = computed(() => store.agentsError)

function reload() {
  return store.fetchAgents({ sort: sort.value, district: district.value || undefined })
}

onMounted(reload)
// Filtr o'zgarsa serverdan qayta so'raymiz — saralash ham server tomonda.
watch([sort, district], reload)

/** Agent bilan to'g'ridan-to'g'ri suhbat ochadi. */
function contact(a) {
  if (!auth.hasToken) {
    ui.toast(t('chat.loginFirst'), 'info')
    return
  }
  active.value = a
  chat.value = true
}

/** Agentga qo'ng'iroq qilish (telefon bo'lsa). */
function call(a) {
  if (!a.phone) {
    ui.toast(a.name, 'info')
    return
  }
  window.location.href = `tel:${a.phone}`
}

function becomeAgent() {
  window.open(AGENT_PORTAL_URL, '_blank', 'noopener,noreferrer')
}

/** Avatar bo'lmasa — ism bosh harflari. */
function initials(a) {
  if (a.initials) return a.initials
  return (
    a.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || '?'
  )
}
</script>

<template>
  <div class="container-x py-8 sm:py-12">
    <div class="max-w-2xl">
      <p class="kicker">{{ $t('home.agentsBlock.kicker') }}</p>
      <h1 class="h2 mt-1.5">{{ $t('agents.title') }}</h1>
      <p class="mt-3 text-sm leading-relaxed text-base-content/65 sm:text-base">{{ $t('agents.subtitle') }}</p>
    </div>

    <div class="mt-7 flex flex-wrap gap-2">
      <select v-model="district" class="field h-11 w-auto cursor-pointer py-0 text-sm">
        <option value="">{{ $t('common.all') }}</option>
        <option v-for="d in DISTRICTS" :key="d.id" :value="d.id">{{ districtName(d.id, locale) }}</option>
      </select>
      <select v-model="sort" class="field h-11 w-auto cursor-pointer py-0 text-sm">
        <option value="rating">{{ $t('agents.sortRating') }}</option>
        <option value="deals">{{ $t('agents.sortDeals') }}</option>
      </select>
    </div>

    <!-- yuklanmoqda -->
    <div v-if="loading" class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="card-soft overflow-hidden p-5">
        <div class="flex items-start gap-4">
          <div class="skeleton-img h-[68px] w-[68px] rounded-2xl"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton-img h-4 w-2/3 rounded"></div>
            <div class="skeleton-img h-3 w-1/2 rounded"></div>
          </div>
        </div>
        <div class="skeleton-img mt-5 h-12 w-full rounded-xl"></div>
      </div>
    </div>

    <!-- xato -->
    <div v-else-if="error" class="mt-6 rounded-2xl bg-error/10 p-6 text-center">
      <p class="text-sm font-semibold text-error">{{ error }}</p>
      <button class="btn btn-sm mt-3 rounded-xl" @click="reload">{{ $t('common.retry') }}</button>
    </div>

    <!-- bo'sh -->
    <div v-else-if="!list.length" class="mt-6 rounded-2xl bg-base-200 px-6 py-14 text-center">
      <Icon name="user" :size="28" class="mx-auto text-base-content/30" />
      <p class="mt-3 font-bold">{{ $t('agents.empty') }}</p>
      <p class="mx-auto mt-1.5 max-w-sm text-sm text-base-content/55">{{ $t('agents.emptyText') }}</p>
    </div>

    <!-- ro'yxat -->
    <div v-else class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="a in list" :key="a.id" class="card-soft card-hover overflow-hidden">
        <div class="flex items-start gap-4 p-5">
          <div class="relative shrink-0">
            <img
              v-if="a.avatar"
              :src="a.avatar"
              :alt="a.name"
              class="h-[68px] w-[68px] rounded-2xl object-cover"
            />
            <div
              v-else
              class="grid h-[68px] w-[68px] place-items-center rounded-2xl bg-primary/10 text-lg font-extrabold text-primary"
            >
              {{ initials(a) }}
            </div>
            <span
              v-if="a.top"
              class="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-content shadow-soft"
            >
              <Icon name="star" :size="12" filled />
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="flex items-center gap-1.5 truncate font-bold">
              {{ a.name }}
              <Icon name="badge" :size="15" class="shrink-0 text-primary" />
            </p>
            <p class="mt-0.5 truncate text-xs text-base-content/55">
              {{ a.district ? districtName(a.district, locale) : '—' }}
            </p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span v-if="a.top" class="pill bg-accent/15 text-accent">{{ $t('agents.top') }}</span>
              <span v-if="a.listingsCount" class="pill bg-base-200 text-base-content/70">
                {{ $t('agents.activeAds', { n: a.listingsCount }) }}
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-px bg-base-300">
          <div class="bg-base-100 px-3 py-3 text-center">
            <p class="text-sm font-extrabold">{{ a.rating ? a.rating.toFixed(1) : '—' }}</p>
            <p class="mt-0.5 text-[10px] uppercase tracking-wide text-base-content/45">{{ $t('agents.rating') }}</p>
          </div>
          <div class="bg-base-100 px-3 py-3 text-center">
            <p class="text-sm font-extrabold">{{ a.deals }}</p>
            <p class="mt-0.5 text-[10px] uppercase tracking-wide text-base-content/45">{{ $t('agents.deals') }}</p>
          </div>
          <div class="bg-base-100 px-3 py-3 text-center">
            <p class="text-sm font-extrabold">{{ $t('agents.years', { n: a.years }) }}</p>
            <p class="mt-0.5 text-[10px] uppercase tracking-wide text-base-content/45">{{ $t('agents.exp') }}</p>
          </div>
        </div>

        <div class="flex gap-2 p-4">
          <button class="btn btn-primary btn-sm flex-1 rounded-xl" @click="contact(a)">
            <Icon name="chat" :size="15" />{{ $t('agents.call') }}
          </button>
          <button
            class="btn btn-ghost btn-sm rounded-xl px-3"
            :title="a.phone || a.name"
            @click="call(a)"
          >
            <Icon name="phone" :size="15" />
          </button>
        </div>
      </div>
    </div>

    <!-- agent bo'lish -->
    <div id="become" class="mt-12 overflow-hidden rounded-[2rem] bg-neutral px-7 py-12 text-neutral-content sm:px-12">
      <div class="grid items-center gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <h2 class="text-2xl font-extrabold tracking-tight sm:text-3xl">{{ $t('agents.become') }}</h2>
          <p class="mt-3 max-w-lg text-sm leading-relaxed text-neutral-content/70">{{ $t('agents.becomeText') }}</p>
        </div>
        <button class="btn btn-primary rounded-xl lg:justify-self-end" @click="becomeAgent">
          {{ $t('agents.become') }}<Icon name="arrow" :size="16" />
        </button>
      </div>
    </div>

    <!-- Agent bilan to'g'ridan-to'g'ri suhbat (e'lonsiz) -->
    <ChatModal v-model="chat" :name="active?.name || ''" :peer-id="active?.id || null" />
  </div>
</template>
