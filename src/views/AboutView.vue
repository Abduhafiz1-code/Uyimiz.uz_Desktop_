<script setup>
import Icon from '@/components/Icon.vue'

const PROBLEMS = ['p1', 'p2', 'p3', 'p4']
const ROADMAP = [
  { t: 'r1t', d: 'r1d', icon: 'home' },
  { t: 'r2t', d: 'r2d', icon: 'trend' },
  { t: 'r3t', d: 'r3d', icon: 'users' },
]
const MONEY = ['m1', 'm2', 'm3', 'm4', 'm5']
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-base-300">
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div class="bg-grid absolute inset-0 text-base-content/[0.07]"></div>
      </div>
      <div class="container-x relative py-14 sm:py-20">
        <p class="kicker">Uyimiz.uz</p>
        <h1 class="h1 mt-3 max-w-3xl">{{ $t('about.title') }}</h1>
        <p class="mt-5 max-w-2xl text-base leading-relaxed text-base-content/65 sm:text-lg">
          {{ $t('about.missionText') }}
        </p>
      </div>
    </section>

    <!-- mission / vision -->
    <section class="section">
      <div class="container-x grid gap-5 lg:grid-cols-2">
        <div class="card-soft p-7 sm:p-9">
          <span class="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon name="shield" :size="20" />
          </span>
          <h2 class="h3 mt-5">{{ $t('about.mission') }}</h2>
          <p class="mt-3 leading-relaxed text-base-content/65">{{ $t('about.missionText') }}</p>
        </div>
        <div class="card-soft p-7 sm:p-9">
          <span class="grid h-11 w-11 place-items-center rounded-2xl bg-accent/15 text-accent">
            <Icon name="sparkles" :size="20" />
          </span>
          <h2 class="h3 mt-5">{{ $t('about.vision') }}</h2>
          <p class="mt-3 leading-relaxed text-base-content/65">{{ $t('about.visionText') }}</p>
        </div>
      </div>
    </section>

    <!-- problem -->
    <section class="section bg-base-200/40">
      <div class="container-x">
        <h2 class="h2">{{ $t('about.problem') }}</h2>
        <div class="mt-7 grid gap-4 sm:grid-cols-2">
          <div v-for="p in PROBLEMS" :key="p" class="flex items-start gap-3 rounded-2xl border border-base-300 bg-base-100 p-5">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-error/10 text-error">
              <Icon name="x" :size="16" :stroke="2.2" />
            </span>
            <p class="pt-1 text-sm leading-relaxed">{{ $t('about.' + p) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- roadmap -->
    <section class="section">
      <div class="container-x">
        <h2 class="h2">{{ $t('about.roadmap') }}</h2>
        <div class="mt-8 space-y-4">
          <div v-for="(r, i) in ROADMAP" :key="i" class="card-soft flex flex-col gap-4 p-6 sm:flex-row sm:p-7">
            <div class="flex items-center gap-3 sm:w-64 sm:shrink-0 sm:flex-col sm:items-start">
              <span class="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Icon :name="r.icon" :size="20" />
              </span>
              <p class="font-bold sm:mt-2">{{ $t('about.' + r.t) }}</p>
            </div>
            <p class="flex-1 leading-relaxed text-base-content/65">{{ $t('about.' + r.d) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- monetisation -->
    <section class="section bg-base-200/40">
      <div class="container-x">
        <h2 class="h2">{{ $t('about.money') }}</h2>
        <div class="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="m in MONEY" :key="m" class="flex items-start gap-3 rounded-2xl border border-base-300 bg-base-100 p-5">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-success/10 text-success">
              <Icon name="wallet" :size="16" />
            </span>
            <p class="pt-1 text-sm leading-relaxed">{{ $t('about.' + m) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- slogan -->
    <section class="section">
      <div class="container-x">
        <div class="relative overflow-hidden rounded-[2rem] bg-neutral px-7 py-16 text-center text-neutral-content sm:px-14">
          <div class="pointer-events-none absolute inset-0">
            <div class="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl"></div>
            <div class="bg-grid absolute inset-0 text-neutral-content/10"></div>
          </div>
          <p class="relative mx-auto max-w-2xl text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
            “{{ $t('about.slogan') }}”
          </p>
          <div class="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <RouterLink to="/post" class="btn btn-primary rounded-xl px-7">{{ $t('nav.postAd') }}</RouterLink>
            <RouterLink to="/search" class="btn btn-outline rounded-xl border-neutral-content/25 px-7 text-neutral-content hover:border-neutral-content hover:bg-neutral-content hover:text-neutral">
              {{ $t('fav.goSearch') }}
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
