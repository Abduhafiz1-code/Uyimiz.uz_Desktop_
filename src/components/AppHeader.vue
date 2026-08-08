<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useListingsStore } from '@/stores/listings'
import Icon from './Icon.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import LangSwitcher from './LangSwitcher.vue'

const ui = useUiStore()
const auth = useAuthStore()
const store = useListingsStore()
const route = useRoute()
const router = useRouter()

const scrolled = ref(false)
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => (scrolled.value = window.scrollY > 8), { passive: true })
}

const links = [
  { name: 'search', label: 'nav.buy', query: { deal: 'sale' } },
  { name: 'search', label: 'nav.rent', query: { deal: 'rent' } },
  { name: 'search', label: 'nav.daily', query: { deal: 'daily' } },
  { name: 'newbuild', label: 'nav.newbuild' },
  { name: 'agents', label: 'nav.agents' },
  { name: 'about', label: 'nav.about' },
]

function isActive(l) {
  if (route.name !== l.name) return false
  if (l.query) return (route.query.deal || 'sale') === l.query.deal
  return true
}

function go(l) {
  ui.mobileMenu = false
  router.push({ name: l.name, query: l.query })
}

function postAd() {
  ui.mobileMenu = false
  router.push({ name: 'post' })
}

watch(() => route.fullPath, () => (ui.mobileMenu = false))
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b transition-all duration-300"
    :class="
      scrolled
        ? 'border-base-300 bg-base-100/85 backdrop-blur-xl shadow-soft'
        : 'border-transparent bg-base-100'
    "
  >
    <div class="container-x flex h-16 items-center gap-2 sm:h-[72px]">
      <!-- logo -->
      <RouterLink to="/" class="group mr-1 flex items-center gap-2.5">
        <span
          class="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-content shadow-soft transition group-hover:scale-105"
        >
          <Icon name="logo" :size="19" :stroke="2" />
        </span>
        <span class="text-[19px] font-extrabold tracking-tight">
          Uyimiz<span class="text-primary">.uz</span>
        </span>
      </RouterLink>

      <!-- desktop nav -->
      <nav class="ml-3 hidden items-center gap-0.5 lg:flex">
        <button
          v-for="(l, i) in links"
          :key="i"
          class="rounded-xl px-3 py-2 text-sm font-semibold transition"
          :class="
            isActive(l)
              ? 'bg-primary/10 text-primary'
              : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
          "
          @click="go(l)"
        >
          {{ $t(l.label) }}
        </button>
      </nav>

      <div class="flex-1"></div>

      <!-- actions -->
      <RouterLink
        to="/favorites"
        class="btn btn-ghost btn-sm relative rounded-xl px-2.5"
        :aria-label="$t('nav.favorites')"
      >
        <Icon name="heart" :size="19" />
        <span
          v-if="store.favorites.length"
          class="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-content"
        >
          {{ store.favorites.length }}
        </span>
      </RouterLink>

      <LangSwitcher />
      <ThemeSwitcher />

      <div v-if="auth.isAuthed" class="dropdown dropdown-end hidden sm:block">
        <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-2 rounded-xl px-2">
          <span class="grid h-7 w-7 place-items-center rounded-lg bg-base-200">
            <Icon name="user" :size="16" />
          </span>
          <Icon name="down" :size="14" class="opacity-50" />
        </div>
        <ul
          tabindex="0"
          class="dropdown-content z-[60] mt-2 w-56 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-lift"
        >
          <li class="border-b border-base-200 px-3 py-2">
            <p class="text-sm font-bold">{{ auth.user.phone }}</p>
            <p class="text-xs text-base-content/50">
              {{ auth.user.verified ? $t('profile.verified') : $t('profile.notVerified') }}
            </p>
          </li>
          <li>
            <RouterLink
              to="/profile"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-base-200"
            >
              <Icon name="user" :size="16" />{{ $t('nav.profile') }}
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/favorites"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-base-200"
            >
              <Icon name="heart" :size="16" />{{ $t('nav.favorites') }}
            </RouterLink>
          </li>
          <li>
            <button
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-error hover:bg-error/10"
              @click="auth.logout(); ui.toast($t('auth.loggedOut'), 'info')"
            >
              <Icon name="logout" :size="16" />{{ $t('nav.logout') }}
            </button>
          </li>
        </ul>
      </div>
      <button
        v-else
        class="btn btn-ghost btn-sm hidden rounded-xl font-semibold sm:inline-flex"
        @click="ui.loginOpen = true"
      >
        {{ $t('nav.login') }}
      </button>

      <button class="btn btn-primary btn-sm hidden rounded-xl font-semibold shadow-soft sm:inline-flex" @click="postAd">
        <Icon name="plus" :size="16" :stroke="2.2" />
        <span class="hidden md:inline">{{ $t('nav.postAd') }}</span>
      </button>

      <button
        class="btn btn-ghost btn-sm rounded-xl px-2 lg:hidden"
        :aria-label="$t('common.menu')"
        @click="ui.mobileMenu = !ui.mobileMenu"
      >
        <Icon :name="ui.mobileMenu ? 'x' : 'menu'" :size="20" />
      </button>
    </div>

    <!-- mobile menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="ui.mobileMenu" class="border-t border-base-300 bg-base-100 lg:hidden">
        <div class="container-x space-y-1 py-3">
          <button
            v-for="(l, i) in links"
            :key="i"
            class="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition"
            :class="isActive(l) ? 'bg-primary/10 text-primary' : 'hover:bg-base-200'"
            @click="go(l)"
          >
            {{ $t(l.label) }}
            <Icon name="right" :size="16" class="opacity-40" />
          </button>
          <div class="grid grid-cols-2 gap-2 pt-2">
            <button v-if="!auth.isAuthed" class="btn btn-outline rounded-xl" @click="ui.loginOpen = true; ui.mobileMenu = false">
              {{ $t('nav.login') }}
            </button>
            <RouterLink v-else to="/profile" class="btn btn-outline rounded-xl">
              {{ $t('nav.profile') }}
            </RouterLink>
            <button class="btn btn-primary rounded-xl" @click="postAd">{{ $t('nav.postAd') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>
