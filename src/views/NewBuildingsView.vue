<script setup>
import { useI18n } from 'vue-i18n'
import { useListingsStore } from '@/stores/listings'
import { useUiStore } from '@/stores/ui'
import { photo, districtName } from '@/data/listings.js'
import SmartImage from '@/components/SmartImage.vue'
import Icon from '@/components/Icon.vue'

const store = useListingsStore()
const ui = useUiStore()
const { locale, t } = useI18n()
</script>

<template>
  <div class="container-x py-8 sm:py-12">
    <div class="max-w-2xl">
      <p class="kicker">{{ $t('nav.newbuild') }}</p>
      <h1 class="h2 mt-1.5">{{ $t('newbuild.title') }}</h1>
      <p class="mt-3 text-sm leading-relaxed text-base-content/65 sm:text-base">{{ $t('newbuild.subtitle') }}</p>
    </div>

    <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="b in store.newbuilds" :key="b.id" class="card-soft card-hover overflow-hidden">
        <div class="relative">
          <SmartImage :src="photo(b.ph, 800)" :seed="'nb' + b.id" ratio="aspect-[4/3]" />
          <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent"></div>
          <span class="pill absolute left-3 top-3 bg-base-100/95 text-primary shadow-soft backdrop-blur">
            <Icon name="building" :size="13" />{{ b.dev }}
          </span>
          <div class="absolute bottom-3 left-4 text-white">
            <p class="text-lg font-extrabold drop-shadow">{{ b.name }}</p>
            <p class="text-xs opacity-90 drop-shadow">{{ districtName(b.district, locale) }}</p>
          </div>
        </div>

        <div class="p-5">
          <div class="flex items-baseline gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-base-content/45">{{ $t('newbuild.from') }}</span>
            <span class="text-xl font-extrabold">${{ b.from }}</span>
            <span class="text-sm text-base-content/55">/ m²</span>
          </div>

          <div class="mt-4 space-y-2 text-sm">
            <p class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-base-content/60"><Icon name="calendar" :size="15" />{{ $t('newbuild.handover') }}</span>
              <span class="font-semibold">{{ b.handover }}</span>
            </p>
            <p class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-base-content/60"><Icon name="wallet" :size="15" />{{ $t('newbuild.installment') }}</span>
              <span class="font-semibold">{{ b.inst }}</span>
            </p>
          </div>

          <button class="btn btn-primary btn-sm mt-5 w-full rounded-xl" @click="ui.toast(b.name, 'info')">
            {{ $t('newbuild.view') }}<Icon name="arrow" :size="15" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
