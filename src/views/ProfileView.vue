<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useListingsStore } from '@/stores/listings'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { photo, districtName, formatPrice } from '@/data/listings.js'
import ListingCard from '@/components/ListingCard.vue'
import SmartImage from '@/components/SmartImage.vue'
import Icon from '@/components/Icon.vue'

const store = useListingsStore()
const ui = useUiStore()
const auth = useAuthStore()
const { t, locale } = useI18n()

const tab = ref('ads')
const TABS = [
  { id: 'ads', label: 'profile.myAds', icon: 'home' },
  { id: 'fav', label: 'profile.myFav', icon: 'heart' },
  { id: 'set', label: 'profile.settings', icon: 'pencil' },
]

const name = ref(auth.user?.name || '')
const busy = ref(false)

// Profil backenddan kech kelishi mumkin — ism maydonini sinxronlab turamiz.
watch(() => auth.user?.name, (v) => { if (v && !name.value) name.value = v })

onMounted(() => {
  if (auth.isAuthed) {
    store.fetchMyAds()
    store.fetchFavorites()
  }
})

async function remove(id) {
  try {
    await store.removeAd(id)
    ui.toast(t('profile.deleted'), 'info')
  } catch (e) {
    ui.toast(e.message || 'Xatolik', 'error')
  }
}

async function verify() {
  busy.value = true
  try {
    await auth.verifyIdentity()
    ui.toast(t('post.verified'))
  } catch (e) {
    ui.toast(e.message || 'Xatolik', 'error')
  } finally {
    busy.value = false
  }
}

async function saveName() {
  busy.value = true
  try {
    await auth.setName(name.value || 'Foydalanuvchi')
    ui.toast(t('common.save'))
  } catch (e) {
    ui.toast(e.message || 'Xatolik', 'error')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="container-x py-8 sm:py-12">
    <!-- not logged in -->
    <div v-if="!auth.isAuthed" class="card-soft mx-auto max-w-md px-6 py-16 text-center">
      <span class="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-base-200 text-base-content/35">
        <Icon name="user" :size="28" />
      </span>
      <p class="mt-6 text-lg font-bold">{{ $t('auth.needLogin') }}</p>
      <button class="btn btn-primary mt-6 rounded-xl" @click="ui.loginOpen = true">{{ $t('nav.login') }}</button>
    </div>

    <template v-else>
      <!-- header -->
      <div class="card-soft flex flex-wrap items-center gap-4 p-5 sm:p-6">
        <span class="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon name="user" :size="26" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-lg font-extrabold">{{ auth.user.name }}</p>
          <p class="font-mono text-sm text-base-content/55">{{ auth.user.phone }}</p>
        </div>
        <span
          class="pill"
          :class="auth.user.verified ? 'bg-success/15 text-success' : 'bg-base-200 text-base-content/55'"
        >
          <Icon name="badge" :size="13" />
          {{ auth.user.verified ? $t('profile.verified') : $t('profile.notVerified') }}
        </span>
        <button v-if="!auth.user.verified" class="btn btn-outline btn-sm rounded-xl" @click="verify">
          {{ $t('profile.verifyNow') }}
        </button>
      </div>

      <!-- tabs -->
      <div class="mt-6 flex gap-1 rounded-xl bg-base-200 p-1">
        <button
          v-for="tb in TABS"
          :key="tb.id"
          class="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition"
          :class="tab === tb.id ? 'bg-base-100 text-primary shadow-soft' : 'text-base-content/60'"
          @click="tab = tb.id"
        >
          <Icon :name="tb.icon" :size="16" />{{ $t(tb.label) }}
        </button>
      </div>

      <!-- my ads -->
      <div v-if="tab === 'ads'" class="mt-6">
        <div v-if="store.myAds.length" class="space-y-3">
          <div v-for="a in store.myAds" :key="a.id" class="card-soft flex flex-wrap items-center gap-4 p-4">
            <SmartImage
              v-if="a.photos?.length"
              :src="photo(a.photos[0], 300)"
              :seed="a.id"
              ratio="aspect-[4/3]"
              rounded="rounded-xl w-24 shrink-0"
            />
            <div class="min-w-0 flex-1">
              <p class="text-lg font-extrabold">{{ formatPrice(a, locale).value }} {{ formatPrice(a, locale).suffix }}</p>
              <p class="truncate text-sm">
                {{ $t('card.rooms', { n: a.rooms }) }} · {{ districtName(a.district, locale) }}, {{ a.address }}
              </p>
              <span class="pill mt-1.5 bg-warning/15 text-warning">{{ $t('profile.status.' + (a.status || 'active')) }}</span>
            </div>
            <div class="flex gap-2">
              <RouterLink :to="{ name: 'listing', params: { id: a.id } }" class="btn btn-ghost btn-sm rounded-xl">
                <Icon name="eye" :size="15" />
              </RouterLink>
              <button class="btn btn-ghost btn-sm rounded-xl text-error" @click="remove(a.id)">
                <Icon name="trash" :size="15" />
              </button>
            </div>
          </div>
        </div>
        <div v-else class="card-soft flex flex-col items-center px-6 py-16 text-center">
          <span class="grid h-14 w-14 place-items-center rounded-2xl bg-base-200 text-base-content/35">
            <Icon name="home" :size="26" />
          </span>
          <p class="mt-5 font-bold">{{ $t('profile.noAds') }}</p>
          <RouterLink to="/post" class="btn btn-primary mt-6 rounded-xl">{{ $t('profile.postFirst') }}</RouterLink>
        </div>
      </div>

      <!-- favorites -->
      <div v-else-if="tab === 'fav'" class="mt-6">
        <div v-if="store.favListings.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ListingCard v-for="l in store.favListings" :key="l.id" :listing="l" />
        </div>
        <div v-else class="card-soft px-6 py-16 text-center">
          <p class="font-bold">{{ $t('fav.empty') }}</p>
          <RouterLink to="/search" class="btn btn-primary mt-5 rounded-xl">{{ $t('fav.goSearch') }}</RouterLink>
        </div>
      </div>

      <!-- settings -->
      <div v-else class="card-soft mt-6 max-w-lg p-5 sm:p-6">
        <div>
          <p class="label-x">{{ $t('post.name') }}</p>
          <input v-model="name" class="field" />
        </div>
        <div class="mt-4">
          <p class="label-x">{{ $t('common.language') }}</p>
          <select :value="ui.locale" class="field cursor-pointer" @change="ui.setLocale($event.target.value)">
            <option v-for="l in ui.locales" :key="l.code" :value="l.code">{{ l.label }}</option>
          </select>
        </div>
        <div class="mt-4">
          <p class="label-x">{{ $t('common.theme') }}</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="th in ui.themes"
              :key="th.id"
              class="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition"
              :class="ui.theme === th.id ? 'border-primary bg-primary/5' : 'border-base-300'"
              @click="ui.setTheme(th.id)"
            >
              <span class="h-4 w-4 rounded-full ring-2 ring-base-300" :style="{ background: th.dot }"></span>
              {{ $t('themes.' + th.id) }}
            </button>
          </div>
        </div>
        <!-- Uyimiz Agent bo'lish — ariza alohida portalda topshiriladi -->
        <a
          href="https://uyimiz-uz-biznes.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-6 flex items-center gap-3 rounded-xl border border-base-300 p-3.5 transition hover:border-primary hover:bg-primary/5"
        >
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon name="badge" :size="17" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-bold">{{ $t('agents.become') }}</span>
            <span class="block truncate text-xs text-base-content/55">{{ $t('agents.becomeText') }}</span>
          </span>
          <Icon name="arrow" :size="16" class="shrink-0 text-base-content/40" />
        </a>

        <div class="mt-6 flex gap-2 border-t border-base-200 pt-5">
          <button class="btn btn-primary rounded-xl" @click="saveName">{{ $t('common.save') }}</button>
          <button class="btn btn-ghost rounded-xl text-error" @click="auth.logout(); ui.toast($t('auth.loggedOut'), 'info')">
            <Icon name="logout" :size="16" />{{ $t('nav.logout') }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
