<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useListingsStore } from '@/stores/listings'
import { useUiStore } from '@/stores/ui'
import { photo, districtName, DISTRICTS } from '@/data/listings.js'
import SmartImage from '@/components/SmartImage.vue'
import ChatModal from '@/components/ChatModal.vue'
import Icon from '@/components/Icon.vue'

const store = useListingsStore()
const ui = useUiStore()
const { locale } = useI18n()

const sort = ref('rating')
const district = ref('')
const chat = ref(false)
const active = ref(null)

const list = computed(() => {
  let out = [...store.agents]
  if (district.value) out = out.filter((a) => a.district === district.value)
  out.sort((a, b) => (sort.value === 'deals' ? b.deals - a.deals : b.rating - a.rating))
  return out
})

function contact(a) {
  active.value = a
  chat.value = true
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

    <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="a in list" :key="a.id" class="card-soft card-hover overflow-hidden">
        <div class="flex items-start gap-4 p-5">
          <div class="relative shrink-0">
            <SmartImage :src="photo(a.ph, 240)" :seed="'ag' + a.id" ratio="aspect-square" rounded="rounded-2xl w-[68px]" />
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
            <p class="mt-0.5 truncate text-xs text-base-content/55">{{ districtName(a.district, locale) }}</p>
            <span v-if="a.top" class="pill mt-2 bg-accent/15 text-accent">{{ $t('agents.top') }}</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-px bg-base-300">
          <div v-for="(k, i) in [
            { l: 'agents.rating', v: a.rating },
            { l: 'agents.deals', v: a.deals },
            { l: 'agents.exp', v: a.years + ' y.' },
          ]" :key="i" class="bg-base-100 px-3 py-3 text-center">
            <p class="text-sm font-extrabold">{{ k.v }}</p>
            <p class="mt-0.5 text-[10px] uppercase tracking-wide text-base-content/45">{{ $t(k.l) }}</p>
          </div>
        </div>

        <div class="flex gap-2 p-4">
          <button class="btn btn-primary btn-sm flex-1 rounded-xl" @click="contact(a)">
            <Icon name="chat" :size="15" />{{ $t('agents.call') }}
          </button>
          <button class="btn btn-ghost btn-sm rounded-xl px-3" @click="ui.toast(a.name, 'info')">
            <Icon name="user" :size="15" />
          </button>
        </div>
      </div>
    </div>

    <!-- become an agent -->
    <div id="become" class="mt-12 overflow-hidden rounded-[2rem] bg-neutral px-7 py-12 text-neutral-content sm:px-12">
      <div class="grid items-center gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <h2 class="text-2xl font-extrabold tracking-tight sm:text-3xl">{{ $t('agents.become') }}</h2>
          <p class="mt-3 max-w-lg text-sm leading-relaxed text-neutral-content/70">{{ $t('agents.becomeText') }}</p>
        </div>
        <button class="btn btn-primary rounded-xl lg:justify-self-end" @click="ui.toast($t('agents.become'), 'success')">
          {{ $t('agents.become') }}<Icon name="arrow" :size="16" />
        </button>
      </div>
    </div>

    <ChatModal v-model="chat" :name="active?.name || ''" />
  </div>
</template>
