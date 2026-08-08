<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useListingsStore } from "@/stores/listings";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { photo, districtName, formatPrice } from "@/data/listings.js";
import Icon from "./Icon.vue";
import SmartImage from "./SmartImage.vue";

const props = defineProps({
  listing: { type: Object, required: true },
  compact: { type: Boolean, default: false },
});

const store = useListingsStore();
const ui = useUiStore();
const auth = useAuthStore();
const { t, locale } = useI18n();

const idx = ref(0);
const l = computed(() => props.listing);
const price = computed(() => formatPrice(l.value, locale.value));
const district = computed(() => districtName(l.value.district, locale.value));
const fav = computed(() => store.isFav(l.value.id));

async function toggle() {
  // Sevimlilar serverda saqlanadi — avval kirish talab qilinadi.
  if (!auth.isAuthed) {
    ui.loginOpen = true;
    ui.toast(t("auth.needLogin"), "info");
    return;
  }
  try {
    const added = await store.toggleFav(l.value.id);
    ui.toast(
      added ? t("card.addFav") : t("card.removeFav"),
      added ? "success" : "info",
    );
  } catch (e) {
    ui.toast(e.message || "Xatolik", "error");
  }
}

function next(e) {
  e.preventDefault();
  if (!l.value.photos?.length) return;
  idx.value = (idx.value + 1) % l.value.photos.length;
}
function prev(e) {
  e.preventDefault();
  if (!l.value.photos?.length) return;
  idx.value = (idx.value - 1 + l.value.photos.length) % l.value.photos.length;
}
</script>

<template>
  <RouterLink
    :to="{ name: 'listing', params: { id: l.id } }"
    class="group card-soft card-hover float-card flex flex-col overflow-hidden">
    <!-- media -->
    <div class="relative">
      <SmartImage
        :src="photo(l.photos[idx], 800)"
        :seed="l.id + idx"
        :alt="district"
        ratio="aspect-[4/3]" />

      <!-- gradient -->
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent"></div>

      <!-- badges -->
      <div class="absolute left-3 top-3 flex flex-wrap gap-1.5">
        <span
          v-if="l.promoted"
          class="pill bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-soft">
          <Icon name="star" :size="12" :filled="true" />{{ $t("card.top") }}
        </span>
        <span
          v-if="l.verified"
          class="pill bg-base-100/95 text-primary shadow-soft backdrop-blur">
          <Icon name="badge" :size="13" :stroke="2.1" />{{
            $t("card.verified")
          }}
        </span>
        <span
          v-if="!l.byAgent"
          class="pill bg-base-100/95 text-base-content shadow-soft backdrop-blur">
          {{ $t("card.noAgent") }}
        </span>
        <span v-else class="pill bg-accent/95 text-accent-content shadow-soft">
          {{ $t("card.agent") }}
        </span>
      </div>

      <!-- fav -->
      <button
        class="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-base-100/90 shadow-soft backdrop-blur transition hover:scale-110 active:scale-95"
        :class="fav ? 'text-error' : 'text-base-content/70'"
        :aria-label="$t(fav ? 'card.removeFav' : 'card.addFav')"
        @click.prevent.stop="toggle">
        <Icon name="heart" :size="18" :filled="fav" />
      </button>

      <!-- carousel arrows -->
      <template v-if="l.photos.length > 1">
        <button
          class="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-base-100/90 opacity-0 shadow-soft transition group-hover:opacity-100"
          @click.prevent.stop="prev">
          <Icon name="left" :size="15" />
        </button>
        <button
          class="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-base-100/90 opacity-0 shadow-soft transition group-hover:opacity-100"
          @click.prevent.stop="next">
          <Icon name="right" :size="15" />
        </button>
        <div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          <span
            v-for="(p, i) in l.photos"
            :key="i"
            class="h-1.5 rounded-full transition-all"
            :class="i === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/55'"></span>
        </div>
      </template>
    </div>

    <!-- body -->
    <div class="flex flex-1 flex-col p-4">
      <div class="flex items-baseline gap-1.5">
        <span class="text-[21px] font-extrabold tracking-tight">{{
          price.value
        }}</span>
        <span
          v-if="price.suffix"
          class="text-sm font-semibold text-base-content/60"
          >{{ price.suffix }}</span
        >
        <span v-if="l.deal === 'rent'" class="text-sm text-base-content/50">{{
          $t("card.perMonth")
        }}</span>
        <span v-if="l.deal === 'daily'" class="text-sm text-base-content/50">{{
          $t("card.perDay")
        }}</span>
      </div>

      <div class="mt-1.5 flex items-center gap-1.5">
        <p class="line-clamp-1 text-sm font-semibold">
          {{ $t("card.rooms", { n: l.rooms }) }} · {{ district }}
        </p>
        <span
          v-if="l.rating"
          class="flex shrink-0 items-center gap-0.5 text-xs font-bold text-amber-500">
          <Icon name="star" :size="12" :filled="true" />{{
            l.rating.toFixed(1)
          }}
        </span>
      </div>
      <p class="mt-0.5 line-clamp-1 text-sm text-base-content/55">
        {{ l.address }} · {{ $t("card.floor", { a: l.floor, b: l.floors }) }}
      </p>

      <div
        class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-base-content/60">
        <span class="flex items-center gap-1"
          ><Icon name="area" :size="14" />{{ l.area }} m²</span
        >
        <span class="flex items-center gap-1"
          ><Icon name="bed" :size="14" />{{ l.rooms }}</span
        >
        <span class="flex items-center gap-1"
          ><Icon name="calendar" :size="14" />{{ l.year }}</span
        >
      </div>

      <div class="mt-3 flex flex-wrap gap-1.5 border-t border-base-200 pt-3">
        <span v-if="l.contractReady" class="pill bg-primary/10 text-primary">
          <Icon name="doc" :size="12" :stroke="2" />{{ $t("card.contract") }}
        </span>
        <span v-if="l.isNew" class="pill bg-accent/15 text-accent">{{
          $t("card.new")
        }}</span>
        <span class="pill bg-base-200 text-base-content/60">
          <Icon name="eye" :size="12" />{{ l.views }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>
