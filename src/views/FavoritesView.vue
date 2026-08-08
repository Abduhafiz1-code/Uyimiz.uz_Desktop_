<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useListingsStore } from '@/stores/listings'
import { useUiStore } from '@/stores/ui'
import ListingCard from '@/components/ListingCard.vue'
import Icon from '@/components/Icon.vue'

const store = useListingsStore()
const ui = useUiStore()
const { t } = useI18n()

onMounted(() => store.fetchFavorites())

async function clear() {
  await store.clearFav()
  ui.toast(t('fav.clear'), 'info')
}
</script>

<template>
  <div class="container-x py-8 sm:py-12">
    <div class="mb-7 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="kicker">{{ $t('nav.favorites') }}</p>
        <h1 class="h2 mt-1.5">{{ $t('fav.title') }}</h1>
      </div>
      <button v-if="store.favListings.length" class="btn btn-ghost btn-sm rounded-xl" @click="clear">
        <Icon name="trash" :size="15" />{{ $t('fav.clear') }}
      </button>
    </div>

    <div v-if="store.favListings.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <ListingCard v-for="l in store.favListings" :key="l.id" :listing="l" />
    </div>

    <div v-else class="card-soft flex flex-col items-center px-6 py-20 text-center">
      <span class="grid h-16 w-16 place-items-center rounded-3xl bg-base-200 text-base-content/35">
        <Icon name="heart" :size="28" />
      </span>
      <p class="mt-6 text-lg font-bold">{{ $t('fav.empty') }}</p>
      <p class="mt-2 max-w-xs text-sm leading-relaxed text-base-content/55">{{ $t('fav.emptyText') }}</p>
      <RouterLink to="/search" class="btn btn-primary mt-7 rounded-xl">{{ $t('fav.goSearch') }}</RouterLink>
    </div>
  </div>
</template>
