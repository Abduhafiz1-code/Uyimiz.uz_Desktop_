<script setup>
import Icon from '@/components/Icon.vue'
</script>

<template>
  <div class="container-x flex flex-col items-center py-28 text-center">
    <p class="text-7xl font-black tracking-tight text-primary/20">404</p>
    <span class="-mt-8 grid h-16 w-16 place-items-center rounded-3xl bg-base-200 text-base-content/40">
      <Icon name="home" :size="28" />
    </span>
    <p class="mt-6 text-xl font-bold">{{ $t('listing.notFound') }}</p>
    <RouterLink to="/" class="btn btn-primary mt-7 rounded-xl">Uyimiz.uz</RouterLink>
  </div>
</template>
