<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useListingsStore } from "@/stores/listings";
import { photo, districtName } from "@/data/listings.js";
import SearchBar from "@/components/SearchBar.vue";
import ListingCard from "@/components/ListingCard.vue";
import SmartImage from "@/components/SmartImage.vue";
import Icon from "@/components/Icon.vue";

const store = useListingsStore();
const router = useRouter();
const { locale } = useI18n();

const latest = computed(() => store.latest);
const featured = computed(() => store.featured);

// Bosh sahifadagi "tanlangan", "so'nggi" bloklari va top agentlar
// backenddan keladi. `ensureAgents` bir marta yuklaydi — sahifalar
// orasida qatnaganda qayta so'ramaydi.
onMounted(() => {
  store.fetchHome();
  store.ensureAgents();
});
const topAgents = computed(() => store.topAgents);

const STATS = [
  { value: "12 480", key: "listings", icon: "home" },
  { value: "0%", key: "commission", icon: "wallet" },
  { value: "2 daq.", key: "contract", icon: "doc" },
  { value: "myID", key: "verify", icon: "badge" },
];

const HOW = [
  { icon: "search", t: "s1t", d: "s1d" },
  { icon: "chat", t: "s2t", d: "s2d" },
  { icon: "doc", t: "s3t", d: "s3d" },
];

const TRUST = [
  { icon: "shield", t: "t1", d: "d1" },
  { icon: "wallet", t: "t2", d: "d2" },
  { icon: "doc", t: "t3", d: "d3" },
  { icon: "globe", t: "t4", d: "d4" },
];

const FUTURE = [
  { icon: "trend", name: "Uyimiz Invest", key: "invest" },
  { icon: "building", name: "Uyimiz Build", key: "build" },
  { icon: "key", name: "Uyimiz Rent", key: "rent" },
  { icon: "grid", name: "Uyimiz Market", key: "market" },
];
</script>

<template>
  <div>
    <!-- ══ HERO ══ -->
    <section class="relative overflow-hidden">
      <div class="pointer-events-none absolute inset-0">
        <div
          class="orb-drift absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl"></div>
        <div
          class="orb-drift absolute -right-32 top-10 h-[26rem] w-[26rem] rounded-full bg-secondary/10 blur-3xl"></div>
        <div class="bg-grid absolute inset-0 text-base-content/[0.07]"></div>
      </div>

      <div
        class="container-x relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
        <div class="animate-fade-up">
          <span
            class="pill border border-primary/25 bg-primary/10 text-primary">
            <span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
            {{ $t("home.badge") }}
          </span>

          <h1 class="h1 mt-5">
            {{ $t("home.title") }}<br />
            <span class="text-primary">{{ $t("home.titleAccent") }}</span>
          </h1>

          <p
            class="mt-5 max-w-lg text-base leading-relaxed text-base-content/65 sm:text-lg">
            {{ $t("home.subtitle") }}
          </p>

          <div class="mt-8">
            <SearchBar hero />
          </div>
        </div>

        <!-- hero collage -->
        <div class="relative hidden lg:block">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-4 pt-10">
              <div class="float-card-alt">
                <SmartImage
                  :src="photo(1, 600)"
                  seed="h1"
                  ratio="aspect-[3/4]"
                  rounded="rounded-3xl shadow-lift" />
              </div>
              <div class="float-card">
                <SmartImage
                  :src="photo(9, 600)"
                  seed="h2"
                  ratio="aspect-square"
                  rounded="rounded-3xl shadow-lift" />
              </div>
            </div>
            <div class="space-y-4">
              <div class="float-card">
                <SmartImage
                  :src="photo(4, 600)"
                  seed="h3"
                  ratio="aspect-square"
                  rounded="rounded-3xl shadow-lift" />
              </div>
              <div class="float-card-alt">
                <SmartImage
                  :src="photo(14, 600)"
                  seed="h4"
                  ratio="aspect-[3/4]"
                  rounded="rounded-3xl shadow-lift" />
              </div>
            </div>
          </div>

          <div
            class="absolute -left-6 top-1/3 card-soft flex items-center gap-3 p-3.5 shadow-lift animate-fade-up float-badge">
            <span
              class="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success">
              <Icon name="badge" :size="20" />
            </span>
            <div>
              <p class="text-sm font-bold leading-none">myID</p>
              <p class="mt-1 text-xs text-base-content/55">
                {{ $t("card.verified") }}
              </p>
            </div>
          </div>

          <div
            class="absolute -right-4 bottom-10 card-soft flex items-center gap-3 p-3.5 shadow-lift animate-fade-up float-badge">
            <span
              class="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
              <Icon name="wallet" :size="20" />
            </span>
            <div>
              <p class="text-sm font-bold leading-none">0%</p>
              <p class="mt-1 text-xs text-base-content/55">
                {{ $t("home.stats.commission") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ STATS ══ -->
    <section class="border-y border-base-300 bg-base-200/40">
      <div
        class="container-x grid grid-cols-2 gap-6 py-8 lg:grid-cols-4 lg:py-10">
        <div v-for="s in STATS" :key="s.key" class="flex items-center gap-3.5">
          <span
            class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-base-100 text-primary shadow-soft">
            <Icon :name="s.icon" :size="20" />
          </span>
          <div>
            <p class="text-xl font-extrabold tracking-tight sm:text-2xl">
              {{ s.value }}
            </p>
            <p class="text-xs text-base-content/55">
              {{ $t("home.stats." + s.key) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ NEW TODAY ══ -->
    <section class="section">
      <div class="container-x">
        <div class="mb-7 flex items-end justify-between gap-4">
          <div>
            <p class="kicker">{{ $t("home.newTodayKicker") }}</p>
            <h2 class="h2 mt-1.5">{{ $t("home.newToday") }}</h2>
          </div>
          <RouterLink
            to="/search"
            class="btn btn-ghost btn-sm rounded-xl font-semibold">
            {{ $t("common.seeAll") }}<Icon name="arrow" :size="16" />
          </RouterLink>
        </div>

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ListingCard v-for="l in latest" :key="l.id" :listing="l" />
        </div>
      </div>
    </section>

    <!-- ══ TWO MODELS ══ -->
    <section class="section bg-base-200/40">
      <div class="container-x">
        <div class="mb-9 text-center">
          <p class="kicker">{{ $t("home.models.kicker") }}</p>
          <h2 class="h2 mt-1.5">{{ $t("home.models.title") }}</h2>
        </div>

        <div class="grid gap-5 lg:grid-cols-2">
          <!-- model 1 -->
          <div class="card-soft float-card relative overflow-hidden p-7 sm:p-9">
            <div
              class="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-2xl"></div>
            <div class="relative">
              <span class="pill bg-primary/10 text-primary">{{
                $t("home.models.free.tag")
              }}</span>
              <h3 class="mt-4 text-2xl font-extrabold tracking-tight">
                {{ $t("home.models.free.title") }}
              </h3>
              <p class="mt-2.5 text-sm leading-relaxed text-base-content/65">
                {{ $t("home.models.free.text") }}
              </p>
              <ul class="mt-6 space-y-3">
                <li
                  v-for="p in ['p1', 'p2', 'p3']"
                  :key="p"
                  class="flex items-start gap-2.5 text-sm">
                  <span
                    class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
                    <Icon name="check" :size="12" :stroke="2.6" />
                  </span>
                  {{ $t("home.models.free." + p) }}
                </li>
              </ul>
              <button
                class="btn btn-primary mt-7 rounded-xl"
                @click="router.push('/search')">
                {{ $t("home.models.free.cta") }}<Icon name="arrow" :size="16" />
              </button>
            </div>
          </div>

          <!-- model 2 -->
          <div
            class="card-soft float-card-alt relative overflow-hidden border-accent/25 bg-accent/[0.04] p-7 sm:p-9">
            <div
              class="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/15 blur-2xl"></div>
            <div class="relative">
              <span class="pill bg-accent/15 text-accent">{{
                $t("home.models.agent.tag")
              }}</span>
              <h3 class="mt-4 text-2xl font-extrabold tracking-tight">
                {{ $t("home.models.agent.title") }}
              </h3>
              <p class="mt-2.5 text-sm leading-relaxed text-base-content/65">
                {{ $t("home.models.agent.text") }}
              </p>
              <ul class="mt-6 space-y-3">
                <li
                  v-for="p in ['p1', 'p2', 'p3']"
                  :key="p"
                  class="flex items-start gap-2.5 text-sm">
                  <span
                    class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-accent/20 text-accent">
                    <Icon name="check" :size="12" :stroke="2.6" />
                  </span>
                  {{ $t("home.models.agent." + p) }}
                </li>
              </ul>
              <button
                class="btn mt-7 rounded-xl border-none bg-accent text-accent-content hover:bg-accent/90"
                @click="router.push('/agents')">
                {{ $t("home.models.agent.cta")
                }}<Icon name="arrow" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ HOW IT WORKS ══ -->
    <section id="how" class="section">
      <div class="container-x">
        <div class="mb-9 text-center">
          <p class="kicker">{{ $t("home.how.kicker") }}</p>
          <h2 class="h2 mt-1.5">{{ $t("home.how.title") }}</h2>
        </div>
        <div class="grid gap-5 md:grid-cols-3">
          <div
            v-for="(s, i) in HOW"
            :key="i"
            class="card-soft card-hover relative p-7">
            <span
              class="absolute right-6 top-5 text-5xl font-black text-base-content/[0.06]"
              >{{ i + 1 }}</span
            >
            <span
              class="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Icon :name="s.icon" :size="22" />
            </span>
            <h3 class="h3 mt-5">{{ $t("home.how." + s.t) }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-base-content/60">
              {{ $t("home.how." + s.d) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ FEATURED ══ -->
    <section class="section bg-base-200/40">
      <div class="container-x">
        <div class="mb-7 flex items-end justify-between gap-4">
          <div>
            <p class="kicker">{{ $t("card.verified") }}</p>
            <h2 class="h2 mt-1.5">{{ $t("home.trust.t1") }}</h2>
          </div>
          <RouterLink
            to="/search?verified=1"
            class="btn btn-ghost btn-sm rounded-xl font-semibold">
            {{ $t("common.seeAll") }}<Icon name="arrow" :size="16" />
          </RouterLink>
        </div>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ListingCard v-for="l in featured" :key="l.id" :listing="l" />
        </div>
      </div>
    </section>

    <!-- ══ TRUST ══ -->
    <section class="section">
      <div class="container-x">
        <div class="mb-9 max-w-2xl">
          <p class="kicker">{{ $t("home.trust.kicker") }}</p>
          <h2 class="h2 mt-1.5">{{ $t("home.trust.title") }}</h2>
        </div>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="t in TRUST" :key="t.t" class="card-soft card-hover p-6">
            <span
              class="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Icon :name="t.icon" :size="20" />
            </span>
            <h3 class="mt-5 text-base font-bold">
              {{ $t("home.trust." + t.t) }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-base-content/60">
              {{ $t("home.trust." + t.d) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ AGENTS ══ -->
    <section class="section bg-base-200/40">
      <div
        class="container-x grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div>
          <p class="kicker">{{ $t("home.agentsBlock.kicker") }}</p>
          <h2 class="h2 mt-1.5">{{ $t("home.agentsBlock.title") }}</h2>
          <p class="mt-4 max-w-md text-sm leading-relaxed text-base-content/65">
            {{ $t("home.agentsBlock.text") }}
          </p>
          <RouterLink to="/agents" class="btn btn-primary mt-6 rounded-xl">
            {{ $t("home.agentsBlock.cta") }}<Icon name="arrow" :size="16" />
          </RouterLink>
        </div>

        <!-- Agent hali yo'q bo'lsa bu blok umuman ko'rsatilmaydi:
             bo'sh kataklar saytni tashlandiq qilib ko'rsatadi. -->
        <div v-if="topAgents.length" class="grid gap-4 sm:grid-cols-2">
          <RouterLink
            v-for="a in topAgents"
            :key="a.id"
            to="/agents"
            class="card-soft card-hover flex items-center gap-3.5 p-4">
            <img
              v-if="a.avatar"
              :src="a.avatar"
              :alt="a.name"
              class="h-14 w-14 shrink-0 rounded-2xl object-cover" />
            <div
              v-else
              class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-base font-extrabold text-primary">
              {{ a.initials || a.name.slice(0, 2).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-bold">{{ a.name }}</p>
              <p class="truncate text-xs text-base-content/55">
                {{ a.district ? districtName(a.district, locale) : "—" }}
              </p>
              <p
                class="mt-1 flex items-center gap-1 text-xs font-semibold text-accent">
                <Icon name="star" :size="12" filled
                />{{ a.rating ? a.rating.toFixed(1) : "—" }}
                <span class="font-normal text-base-content/45"
                  >· {{ $t("listing.deals", { n: a.deals }) }}</span
                >
              </p>
            </div>
          </RouterLink>
        </div>

        <div
          v-else
          class="card-soft grid place-items-center px-6 py-12 text-center">
          <Icon name="user" :size="26" class="text-base-content/25" />
          <p class="mt-3 text-sm font-bold">{{ $t("agents.empty") }}</p>
          <p class="mt-1 max-w-xs text-xs text-base-content/55">
            {{ $t("agents.emptyText") }}
          </p>
        </div>
      </div>
    </section>

    <!-- ══ CTA ══ -->
    <section class="section">
      <div class="container-x">
        <div
          class="relative overflow-hidden rounded-[2rem] bg-neutral px-7 py-14 text-neutral-content sm:px-14">
          <div class="pointer-events-none absolute inset-0">
            <div
              class="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl"></div>
            <div
              class="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl"></div>
            <div class="bg-grid absolute inset-0 text-neutral-content/10"></div>
          </div>
          <div class="relative mx-auto max-w-2xl text-center">
            <h2 class="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {{ $t("home.cta.title") }}
            </h2>
            <p
              class="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-neutral-content/70 sm:text-base">
              {{ $t("home.cta.text") }}
            </p>
            <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <RouterLink to="/post" class="btn btn-primary rounded-xl px-7">
                <Icon name="plus" :size="17" :stroke="2.2" />{{
                  $t("home.cta.btn")
                }}
              </RouterLink>
              <a
                href="#how"
                class="btn btn-outline rounded-xl border-neutral-content/25 px-7 text-neutral-content hover:border-neutral-content hover:bg-neutral-content hover:text-neutral">
                {{ $t("home.cta.btn2") }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ FUTURE ══ -->
    <section class="pb-16">
      <div class="container-x">
        <div class="mb-7">
          <p class="kicker">{{ $t("home.future.kicker") }}</p>
          <h2 class="h2 mt-1.5">{{ $t("home.future.title") }}</h2>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="f in FUTURE"
            :key="f.key"
            class="rounded-2xl border border-dashed border-base-300 p-5">
            <span
              class="grid h-10 w-10 place-items-center rounded-xl bg-base-200 text-base-content/60">
              <Icon :name="f.icon" :size="18" />
            </span>
            <p class="mt-4 text-sm font-bold">{{ f.name }}</p>
            <p class="mt-1 text-xs leading-relaxed text-base-content/55">
              {{ $t("home.future." + f.key) }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
