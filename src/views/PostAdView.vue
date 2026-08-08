<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useListingsStore } from '@/stores/listings'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { DISTRICTS, districtName, photo } from '@/data/listings.js'
import SmartImage from '@/components/SmartImage.vue'
import Icon from '@/components/Icon.vue'

const store = useListingsStore()
const ui = useUiStore()
const auth = useAuthStore()
const router = useRouter()
const { t, locale } = useI18n()

const STEPS = ['post.s1', 'post.s2', 'post.s3', 'post.s4']
const REPAIRS = ['euro', 'good', 'average', 'designer', 'none']
const PTYPES = ['apartment', 'house', 'newbuild', 'commercial']
const FEATURES = ['metro', 'furnished', 'parking', 'lift', 'balcony', 'ac', 'school', 'pets']

const step = ref(1)
const created = ref(null)
const touched = ref(false)

const form = reactive({
  deal: 'sale',
  ptype: 'apartment',
  district: '',
  address: '',
  price: null,
  rooms: 2,
  area: null,
  floor: 1,
  floors: 9,
  year: 2015,
  repair: 'good',
  photos: [],
  description: '',
  features: [],
  name: '',
  phone: '',
})

const stepValid = computed(() => {
  if (step.value === 1) return !!form.district && !!form.address && !!form.price
  if (step.value === 2) return !!form.area && !!form.rooms
  if (step.value === 3) return form.photos.length > 0
  return !!form.name && form.phone.replace(/\D/g, '').length >= 9
})

function err(cond) {
  return touched.value && !cond
}

function next() {
  touched.value = true
  if (!stepValid.value) return
  touched.value = false
  step.value = Math.min(4, step.value + 1)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function back() {
  touched.value = false
  step.value = Math.max(1, step.value - 1)
}

function addPhoto() {
  form.photos.push(Math.floor(Math.random() * 26) + form.photos.length)
}
function removePhoto(i) {
  form.photos.splice(i, 1)
}
function toggleFeature(f) {
  const i = form.features.indexOf(f)
  if (i === -1) form.features.push(f)
  else form.features.splice(i, 1)
}

function verify() {
  if (!auth.isAuthed) {
    ui.loginOpen = true
    return
  }
  auth.verify()
  ui.toast(t('post.verified'))
}

function publish() {
  touched.value = true
  if (!stepValid.value) return
  if (!auth.isAuthed) {
    ui.loginOpen = true
    ui.toast(t('auth.needLogin'), 'info')
    return
  }
  const ad = store.addAd({
    deal: form.deal,
    district: form.district,
    address: form.address,
    price: Number(form.price),
    currency: form.deal === 'rent' ? 'uzs' : 'usd',
    rooms: Number(form.rooms),
    area: Number(form.area),
    floor: Number(form.floor),
    floors: Number(form.floors),
    year: Number(form.year),
    ptype: form.ptype,
    repair: form.repair,
    docs: 'ready',
    features: form.features.length ? form.features : ['metro'],
    verified: auth.user?.verified || false,
    byAgent: false,
    agentId: null,
    contractReady: true,
    owner: form.name,
    ownerSince: new Date().getFullYear(),
    ownerAds: 1,
    photos: form.photos,
    description: form.description,
    lat: 41.29,
    lng: 69.24,
  })
  created.value = ad
  ui.toast(t('post.success'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function again() {
  created.value = null
  step.value = 1
  Object.assign(form, {
    district: '', address: '', price: null, area: null,
    photos: [], description: '', features: [],
  })
}
</script>

<template>
  <div class="container-x max-w-3xl py-8 sm:py-12">
    <!-- success -->
    <div v-if="created" class="card-soft p-8 text-center sm:p-12">
      <span class="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-success/15 text-success">
        <Icon name="check" :size="30" :stroke="2.4" />
      </span>
      <h1 class="mt-6 text-2xl font-extrabold tracking-tight">{{ $t('post.success') }}</h1>
      <p class="mx-auto mt-3 max-w-md text-sm leading-relaxed text-base-content/65">{{ $t('post.successText') }}</p>
      <div class="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
        <RouterLink :to="{ name: 'listing', params: { id: created.id } }" class="btn btn-primary rounded-xl">
          {{ $t('post.viewAd') }}
        </RouterLink>
        <button class="btn btn-outline rounded-xl" @click="again">{{ $t('post.postMore') }}</button>
        <RouterLink to="/profile" class="btn btn-ghost rounded-xl">{{ $t('nav.profile') }}</RouterLink>
      </div>
    </div>

    <template v-else>
      <div>
        <h1 class="h2">{{ $t('post.title') }}</h1>
        <p class="mt-2 text-sm text-base-content/60">{{ $t('post.subtitle') }}</p>
      </div>

      <!-- stepper -->
      <div class="mt-7 flex items-center gap-2">
        <template v-for="(s, i) in STEPS" :key="s">
          <div class="flex items-center gap-2">
            <span
              class="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold transition"
              :class="
                step > i + 1
                  ? 'bg-success/15 text-success'
                  : step === i + 1
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-200 text-base-content/40'
              "
            >
              <Icon v-if="step > i + 1" name="check" :size="14" :stroke="2.5" />
              <template v-else>{{ i + 1 }}</template>
            </span>
            <span class="hidden text-xs font-semibold sm:inline" :class="step === i + 1 ? '' : 'text-base-content/45'">
              {{ $t(s) }}
            </span>
          </div>
          <span v-if="i < 3" class="h-px flex-1 bg-base-300"></span>
        </template>
      </div>

      <div class="card-soft mt-6 p-5 sm:p-7">
        <!-- STEP 1 -->
        <div v-if="step === 1" class="space-y-5">
          <div>
            <p class="label-x">{{ $t('post.dealType') }}</p>
            <div class="flex gap-1 rounded-xl bg-base-200 p-1">
              <button
                v-for="d in ['sale', 'rent', 'daily']"
                :key="d"
                class="flex-1 rounded-lg py-2.5 text-sm font-semibold transition"
                :class="form.deal === d ? 'bg-base-100 text-primary shadow-soft' : 'text-base-content/60'"
                @click="form.deal = d"
              >
                {{ $t('deal.' + d) }}
              </button>
            </div>
          </div>

          <div>
            <p class="label-x">{{ $t('post.propType') }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="p in PTYPES"
                :key="p"
                class="rounded-xl border px-4 py-2.5 text-sm font-medium transition"
                :class="form.ptype === p ? 'border-primary bg-primary/10 text-primary' : 'border-base-300 hover:border-primary/50'"
                @click="form.ptype = p"
              >
                {{ $t('ptype.' + p) }}
              </button>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="label-x">{{ $t('post.district') }}</p>
              <select v-model="form.district" class="field cursor-pointer" :class="err(form.district) && 'border-error'">
                <option value="">—</option>
                <option v-for="d in DISTRICTS" :key="d.id" :value="d.id">{{ districtName(d.id, locale) }}</option>
              </select>
              <p v-if="err(form.district)" class="mt-1 text-xs text-error">{{ $t('post.errRequired') }}</p>
            </div>
            <div>
              <p class="label-x">{{ $t('post.address') }}</p>
              <input v-model="form.address" class="field" :class="err(form.address) && 'border-error'" placeholder="11-kvartal" />
              <p v-if="err(form.address)" class="mt-1 text-xs text-error">{{ $t('post.errRequired') }}</p>
            </div>
          </div>

          <div>
            <p class="label-x">
              {{ $t('post.price') }}
              <span class="normal-case text-base-content/40">
                ({{ form.deal === 'rent' ? $t('units.sum') + ', mln' : '$' }})
              </span>
            </p>
            <input v-model.number="form.price" type="number" class="field" :class="err(form.price) && 'border-error'" placeholder="54000" />
            <p v-if="err(form.price)" class="mt-1 text-xs text-error">{{ $t('post.errRequired') }}</p>
          </div>
        </div>

        <!-- STEP 2 -->
        <div v-else-if="step === 2" class="space-y-5">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="label-x">{{ $t('post.rooms') }}</p>
              <div class="flex gap-1.5">
                <button
                  v-for="n in [1, 2, 3, 4, 5]"
                  :key="n"
                  class="h-11 flex-1 rounded-xl border text-sm font-semibold transition"
                  :class="form.rooms === n ? 'border-primary bg-primary text-primary-content' : 'border-base-300'"
                  @click="form.rooms = n"
                >
                  {{ n === 5 ? '5+' : n }}
                </button>
              </div>
            </div>
            <div>
              <p class="label-x">{{ $t('post.area') }}</p>
              <input v-model.number="form.area" type="number" class="field" :class="err(form.area) && 'border-error'" placeholder="72" />
              <p v-if="err(form.area)" class="mt-1 text-xs text-error">{{ $t('post.errRequired') }}</p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <p class="label-x">{{ $t('post.floor') }}</p>
              <input v-model.number="form.floor" type="number" min="1" class="field" />
            </div>
            <div>
              <p class="label-x">{{ $t('post.floors') }}</p>
              <input v-model.number="form.floors" type="number" min="1" class="field" />
            </div>
            <div>
              <p class="label-x">{{ $t('post.year') }}</p>
              <input v-model.number="form.year" type="number" class="field" />
            </div>
          </div>

          <div>
            <p class="label-x">{{ $t('post.repair') }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="r in REPAIRS"
                :key="r"
                class="rounded-xl border px-4 py-2.5 text-sm font-medium transition"
                :class="form.repair === r ? 'border-primary bg-primary/10 text-primary' : 'border-base-300 hover:border-primary/50'"
                @click="form.repair = r"
              >
                {{ $t('repair.' + r) }}
              </button>
            </div>
          </div>

          <div>
            <p class="label-x">{{ $t('post.features') }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="ft in FEATURES"
                :key="ft"
                class="rounded-xl border px-3.5 py-2 text-sm transition"
                :class="form.features.includes(ft) ? 'border-primary bg-primary/10 text-primary' : 'border-base-300 hover:border-primary/50'"
                @click="toggleFeature(ft)"
              >
                {{ $t('feature.' + ft) }}
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 3 -->
        <div v-else-if="step === 3" class="space-y-5">
          <div>
            <p class="label-x">{{ $t('post.photos') }}</p>
            <p class="mb-3 text-xs text-base-content/55">{{ $t('post.photosHint') }}</p>
            <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
              <div v-for="(p, i) in form.photos" :key="i" class="group relative">
                <SmartImage :src="photo(p, 400)" :seed="p" ratio="aspect-square" rounded="rounded-xl" />
                <button
                  class="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-lg bg-base-100/90 text-error opacity-0 shadow-soft transition group-hover:opacity-100"
                  @click="removePhoto(i)"
                >
                  <Icon name="trash" :size="14" />
                </button>
                <span v-if="i === 0" class="pill absolute bottom-1.5 left-1.5 bg-primary text-primary-content">1</span>
              </div>
              <button
                class="grid aspect-square place-items-center rounded-xl border-2 border-dashed transition"
                :class="err(form.photos.length) ? 'border-error text-error' : 'border-base-300 text-base-content/45 hover:border-primary hover:text-primary'"
                @click="addPhoto"
              >
                <span class="text-center">
                  <Icon name="camera" :size="22" class="mx-auto" />
                  <span class="mt-1.5 block text-[11px] font-semibold">{{ $t('post.addPhoto') }}</span>
                </span>
              </button>
            </div>
            <p v-if="err(form.photos.length)" class="mt-2 text-xs text-error">{{ $t('post.errRequired') }}</p>
          </div>

          <div>
            <p class="label-x">{{ $t('post.desc') }}</p>
            <textarea
              v-model="form.description"
              rows="5"
              class="field resize-none"
              :placeholder="$t('post.descPlaceholder')"
            ></textarea>
          </div>
        </div>

        <!-- STEP 4 -->
        <div v-else class="space-y-5">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="label-x">{{ $t('post.name') }}</p>
              <input v-model="form.name" class="field" :class="err(form.name) && 'border-error'" placeholder="Dilshod A." />
              <p v-if="err(form.name)" class="mt-1 text-xs text-error">{{ $t('post.errRequired') }}</p>
            </div>
            <div>
              <p class="label-x">{{ $t('post.phone') }}</p>
              <input v-model="form.phone" class="field" :class="err(form.phone.replace(/\D/g, '').length >= 9) && 'border-error'" placeholder="+998 90 123 45 67" />
            </div>
          </div>

          <div
            class="flex items-center gap-3 rounded-2xl border p-4"
            :class="auth.user?.verified ? 'border-success/30 bg-success/[0.07]' : 'border-base-300'"
          >
            <span
              class="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              :class="auth.user?.verified ? 'bg-success/15 text-success' : 'bg-base-200 text-base-content/50'"
            >
              <Icon name="badge" :size="19" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold">myID</p>
              <p class="text-xs text-base-content/55">
                {{ auth.user?.verified ? $t('post.verified') : $t('post.verify') }}
              </p>
            </div>
            <button v-if="!auth.user?.verified" class="btn btn-outline btn-sm rounded-xl" @click="verify">
              {{ $t('profile.verifyNow') }}
            </button>
            <Icon v-else name="check" :size="20" class="text-success" />
          </div>

          <!-- preview -->
          <div class="rounded-2xl bg-base-200/60 p-4">
            <p class="label-x">{{ $t('post.title') }}</p>
            <div class="flex items-center gap-3">
              <SmartImage
                v-if="form.photos.length"
                :src="photo(form.photos[0], 300)"
                :seed="form.photos[0]"
                ratio="aspect-[4/3]"
                rounded="rounded-xl w-24 shrink-0"
              />
              <div class="min-w-0">
                <p class="text-lg font-extrabold">
                  {{ form.deal === 'rent' ? form.price + ' mln' : '$' + (form.price || 0).toLocaleString('en-US') }}
                </p>
                <p class="truncate text-sm">
                  {{ $t('card.rooms', { n: form.rooms }) }} · {{ districtName(form.district, locale) }}
                </p>
                <p class="truncate text-xs text-base-content/55">{{ form.address }} · {{ form.area }} m²</p>
              </div>
            </div>
          </div>
        </div>

        <!-- nav -->
        <div class="mt-7 flex items-center justify-between border-t border-base-200 pt-5">
          <button class="btn btn-ghost rounded-xl" :disabled="step === 1" @click="back">
            <Icon name="left" :size="16" />{{ $t('common.back') }}
          </button>
          <span class="text-xs font-semibold text-base-content/45">{{ $t('post.step', { a: step, b: 4 }) }}</span>
          <button v-if="step < 4" class="btn btn-primary rounded-xl" @click="next">
            {{ $t('common.next') }}<Icon name="right" :size="16" />
          </button>
          <button v-else class="btn btn-primary rounded-xl" @click="publish">
            <Icon name="check" :size="16" :stroke="2.3" />{{ $t('post.publish') }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
