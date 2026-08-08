<script setup>
import Icon from './Icon.vue'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-8 border-t border-base-300 bg-base-200/50">
    <div class="container-x py-14">
      <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div class="lg:col-span-2">
          <div class="flex items-center gap-2.5">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-content">
              <Icon name="logo" :size="19" :stroke="2" />
            </span>
            <span class="text-[19px] font-extrabold tracking-tight">
              Uyimiz<span class="text-primary">.uz</span>
            </span>
          </div>
          <p class="mt-4 max-w-sm text-sm leading-relaxed text-base-content/60">
            {{ $t('footer.tagline') }}
          </p>
          <div class="mt-5 flex gap-2">
            <a
              v-for="ic in ['telegram', 'instagram']"
              :key="ic"
              href="#"
              class="grid h-10 w-10 place-items-center rounded-xl border border-base-300 bg-base-100 text-base-content/70 transition hover:border-primary hover:text-primary"
              @click.prevent
            >
              <Icon :name="ic" :size="18" />
            </a>
          </div>
        </div>

        <div>
          <p class="mb-3 text-xs font-bold uppercase tracking-wider text-base-content/40">
            {{ $t('footer.product') }}
          </p>
          <ul class="space-y-2.5 text-sm text-base-content/70">
            <li><RouterLink to="/search?deal=sale" class="hover:text-primary">{{ $t('nav.buy') }}</RouterLink></li>
            <li><RouterLink to="/search?deal=rent" class="hover:text-primary">{{ $t('nav.rent') }}</RouterLink></li>
            <li><RouterLink to="/new-buildings" class="hover:text-primary">{{ $t('nav.newbuild') }}</RouterLink></li>
            <li><RouterLink to="/agents" class="hover:text-primary">{{ $t('nav.agents') }}</RouterLink></li>
          </ul>
        </div>

        <div>
          <p class="mb-3 text-xs font-bold uppercase tracking-wider text-base-content/40">
            {{ $t('footer.company') }}
          </p>
          <ul class="space-y-2.5 text-sm text-base-content/70">
            <li><RouterLink to="/about" class="hover:text-primary">{{ $t('nav.about') }}</RouterLink></li>
            <li><RouterLink to="/post" class="hover:text-primary">{{ $t('nav.postAd') }}</RouterLink></li>
            <li><RouterLink to="/agents#become" class="hover:text-primary">{{ $t('agents.become') }}</RouterLink></li>
          </ul>
        </div>

        <div>
          <p class="mb-3 text-xs font-bold uppercase tracking-wider text-base-content/40">
            {{ $t('footer.contacts') }}
          </p>
          <ul class="space-y-2.5 text-sm text-base-content/70">
            <li class="flex items-center gap-2"><Icon name="phone" :size="15" /> +998 71 200 00 00</li>
            <li class="flex items-center gap-2"><Icon name="chat" :size="15" /> hello@uyimiz.uz</li>
            <li class="flex items-center gap-2"><Icon name="pin" :size="15" /> Toshkent, O‘zbekiston</li>
          </ul>
        </div>
      </div>

      <div
        class="mt-12 flex flex-col gap-3 border-t border-base-300 pt-6 text-xs text-base-content/50 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>{{ $t('footer.rights', { year }) }}</p>
        <div class="flex flex-wrap gap-4">
          <a href="#" class="hover:text-primary" @click.prevent>{{ $t('footer.terms') }}</a>
          <a href="#" class="hover:text-primary" @click.prevent>{{ $t('footer.privacy') }}</a>
          <a href="#" class="hover:text-primary" @click.prevent>{{ $t('footer.offer') }}</a>
        </div>
      </div>
      <p class="mt-3 text-[11px] text-base-content/35">{{ $t('footer.demo') }}</p>
    </div>
  </footer>
</template>
