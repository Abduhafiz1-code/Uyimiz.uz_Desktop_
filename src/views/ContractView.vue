<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { contracts as contractsApi } from '@/api'
import { districtName, formatPrice } from '@/data/listings.js'
import Icon from '@/components/Icon.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const { t, locale } = useI18n()

// Bu sahifa endi SHARTNOMA id'si bilan ochiladi (avval e'lon id'si edi).
// Shartnoma ContractModal orqali yaratiladi va shu yerga yo'naltiriladi.
const contract = ref(null)
const loading = ref(true)
const loadError = ref('')

/**
 * Shablon avvalgidek `l` (e'lon) obyektini o'qiydi — shartnomadan
 * shu shaklda yasab beramiz, natijada shablonga tegish shart emas.
 */
const l = computed(() => {
  const c = contract.value
  if (!c) return null
  return {
    id: c.listingId,
    deal: c.deal,
    district: c.listingDistrict,
    address: c.listingAddress,
    area: c.listingArea,
    price: c.price,
    currency: c.currency,
    owner: c.sellerName || t('contract.seller'),
  }
})

const price = computed(() => (l.value ? formatPrice(l.value, locale.value) : null))
const district = computed(() => (l.value ? districtName(l.value.district, locale.value) : ''))

const STAGES = [
  { key: 'agree', icon: 'chat' },
  { key: 'info', icon: 'doc' },
  { key: 'sign', icon: 'key' },
  { key: 'pdf', icon: 'check' },
]

const sellerSigned = computed(() => !!contract.value?.sellerSigned)
const buyerSigned = computed(() => !!contract.value?.buyerSigned)

/** Bosqich shartnomaning haqiqiy holatidan kelib chiqadi. */
const stage = computed(() => {
  const c = contract.value
  if (!c) return 0
  if (c.status === 'signed' || c.buyerSigned) return 3
  if (codeSent.value) return 2
  if (c.sellerSigned || c.status === 'awaiting_sign') return 1
  return 0
})

const codeSent = ref(false)
const digits = ref(['', '', '', ''])
const inputs = ref([])
const signing = ref(false)
const actionError = ref('')
const sentTo = computed(() => auth.user?.phone || '+998 90 --- -- --')
const cooldown = ref(0)
let timer = null

function startTimer(sec = 60) {
  cooldown.value = sec
  clearInterval(timer)
  timer = setInterval(() => {
    if (cooldown.value > 0) cooldown.value--
    else clearInterval(timer)
  }, 1000)
}
onUnmounted(() => clearInterval(timer))

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    contract.value = await contractsApi.byId(route.params.id)
  } catch (e) {
    loadError.value = e.message || t('common.notFound')
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(() => route.params.id, load)

function onDigit(i, e) {
  const v = e.target.value.replace(/\D/g, '').slice(-1)
  digits.value[i] = v
  if (v && i < 3) inputs.value[i + 1]?.focus()
  if (digits.value.every((d) => d !== '')) setTimeout(submitSign, 250)
}
function onBackspace(i, e) {
  if (e.key === 'Backspace' && !digits.value[i] && i > 0) inputs.value[i - 1]?.focus()
}

/** Xaridor imzolashni boshlaydi — backend SMS kod yuboradi. */
async function proceed() {
  if (!auth.isAuthed) {
    ui.loginOpen = true
    ui.toast(t('auth.needLogin'), 'info')
    return
  }
  actionError.value = ''
  try {
    const res = await contractsApi.signRequest(contract.value.id)
    codeSent.value = true
    digits.value = ['', '', '', '']
    startTimer(60)
    if (res?.demoCode) ui.toast(`Test kodi: ${res.demoCode}`, 'info')
  } catch (e) {
    actionError.value = e.message || t('common.netError')
  }
}

async function submitSign() {
  if (signing.value) return
  const code = digits.value.join('')
  if (code.length < 4) return
  signing.value = true
  actionError.value = ''
  try {
    contract.value = await contractsApi.sign(contract.value.id, code)
    ui.toast(t('contract.generated'))
  } catch (e) {
    actionError.value = e.message || t('common.netError')
    digits.value = ['', '', '', '']
    inputs.value[0]?.focus()
  } finally {
    signing.value = false
  }
}

/** Sotuvchi tomoni: shartnomani tasdiqlash. */
async function approve() {
  actionError.value = ''
  try {
    contract.value = await contractsApi.approve(contract.value.id)
    ui.toast(t('common.save'))
  } catch (e) {
    actionError.value = e.message || t('common.netError')
  }
}

async function cancel() {
  actionError.value = ''
  try {
    contract.value = await contractsApi.cancel(contract.value.id)
    ui.toast(t('common.cancel'), 'info')
  } catch (e) {
    actionError.value = e.message || t('common.netError')
  }
}

function downloadPdf() {
  if (contract.value?.pdfUrl) window.open(contract.value.pdfUrl, '_blank')
  else ui.toast(t('contract.pdfLater'), 'info')
}

const contractId = computed(() =>
  contract.value ? `UZ-${new Date(contract.value.createdAt).getFullYear()}-${contract.value.id}` : ''
)
</script>

<template>
  <div v-if="l" class="container-x max-w-5xl py-8 sm:py-12">
    <button class="mb-5 flex items-center gap-1.5 text-sm font-semibold text-base-content/55 hover:text-primary" @click="router.back()">
      <Icon name="left" :size="15" />{{ $t('common.back') }}
    </button>

    <div class="mb-8 flex flex-wrap items-end justify-between gap-3 animate-fade-up">
      <div>
        <p class="kicker">E-IMZO · PDF</p>
        <h1 class="h2 mt-1.5">{{ $t('contract.title') }}</h1>
        <p class="mt-2 max-w-lg text-sm text-base-content/60">{{ $t('contract.subtitle') }}</p>
      </div>
      <RouterLink :to="{ name: 'listing', params: { id: l.id } }" class="btn btn-ghost btn-sm rounded-xl">
        {{ district }}, {{ l.address }}
      </RouterLink>
    </div>

    <!-- stage tracker -->
    <div class="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div
        v-for="(s, i) in STAGES"
        :key="s.key"
        class="card-soft relative overflow-hidden p-4 transition-all duration-500"
        :class="stage === i ? 'border-primary/40 ring-2 ring-primary/15' : stage > i ? 'opacity-80' : 'opacity-60'"
      >
        <p class="font-mono text-[11px] text-base-content/35">{{ String(i + 1).padStart(2, '0') }}</p>
        <div class="mt-1.5 flex items-center gap-2">
          <span
            class="grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors duration-300"
            :class="stage > i ? 'bg-success/15 text-success' : stage === i ? 'bg-primary/15 text-primary' : 'bg-base-200 text-base-content/40'"
          >
            <Icon v-if="stage > i" name="check" :size="14" :stroke="2.5" />
            <Icon v-else :name="s.icon" :size="14" />
          </span>
          <p class="text-sm font-bold">{{ $t('contract.stage.' + s.key) }}</p>
        </div>
        <p class="mt-2 text-xs leading-relaxed text-base-content/55">{{ $t('contract.stageDesc.' + s.key) }}</p>
        <div
          v-if="stage === i"
          class="absolute inset-x-0 bottom-0 h-0.5 origin-left animate-[fade-in_.4s_ease] bg-primary"
        ></div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
      <!-- document -->
      <div class="card-soft overflow-hidden p-6 sm:p-8" style="background: repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,0,0,.02) 40px)">
        <div class="flex items-start justify-between border-b border-dashed border-base-300 pb-5">
          <div>
            <h2 class="text-xl font-extrabold tracking-tight">
              {{ l.deal === 'rent' ? $t('contract.doc.rent') : $t('contract.doc.sale') }}
            </h2>
            <p class="mt-1 font-mono text-xs text-base-content/45">№ {{ contractId }} · Toshkent</p>
          </div>
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon name="doc" :size="20" />
          </span>
        </div>

        <dl class="mt-5 divide-y divide-base-200 text-sm">
          <div class="flex items-center justify-between py-3">
            <dt class="text-base-content/55">{{ $t('contract.seller') }}</dt>
            <dd class="font-semibold">{{ l.owner }}</dd>
          </div>
          <div class="flex items-center justify-between py-3">
            <dt class="text-base-content/55">{{ $t('contract.buyer') }}</dt>
            <dd class="font-semibold">{{ auth.user?.name || auth.user?.phone || '—' }}</dd>
          </div>
          <div class="flex items-center justify-between py-3">
            <dt class="text-base-content/55">{{ $t('contract.object') }}</dt>
            <dd class="text-right font-semibold">{{ district }}, {{ l.address }} · {{ l.area }} m²</dd>
          </div>
          <div v-if="l.deal === 'rent'" class="flex items-center justify-between py-3">
            <dt class="text-base-content/55">{{ $t('contract.term') }}</dt>
            <dd class="font-semibold">{{ $t('contract.termVal') }}</dd>
          </div>
          <div class="flex items-center justify-between py-3">
            <dt class="text-base-content/55">{{ l.deal === 'rent' ? $t('contract.monthly') : $t('contract.price') }}</dt>
            <dd class="text-lg font-extrabold">{{ price.value }} {{ price.suffix }}</dd>
          </div>
          <div v-if="l.deal === 'rent'" class="flex items-center justify-between py-3">
            <dt class="text-base-content/55">{{ $t('contract.deposit') }}</dt>
            <dd class="font-semibold">{{ $t('contract.depositVal') }}</dd>
          </div>
        </dl>

        <p class="mt-5 text-xs leading-relaxed text-base-content/45">{{ $t('contract.legal') }}</p>

        <div class="mt-8 grid grid-cols-2 gap-6">
          <div class="border-t border-base-300 pt-2">
            <p class="text-xs text-base-content/45">{{ $t('listing.owner') }}</p>
            <p class="mt-1 flex items-center gap-1.5 text-sm font-semibold">
              <Transition name="fade" mode="out-in">
                <span v-if="sellerSigned" key="ok" class="flex items-center gap-1.5 text-success">
                  <Icon name="check" :size="14" :stroke="2.5" />{{ $t('contract.signed') }}
                </span>
                <span v-else key="wait" class="text-base-content/45">{{ $t('contract.pending') }}</span>
              </Transition>
            </p>
          </div>
          <div class="border-t border-base-300 pt-2">
            <p class="text-xs text-base-content/45">{{ auth.user?.name || $t('contract.buyer') }}</p>
            <p class="mt-1 flex items-center gap-1.5 text-sm font-semibold">
              <Transition name="fade" mode="out-in">
                <span v-if="buyerSigned" key="ok" class="flex items-center gap-1.5 text-success">
                  <Icon name="check" :size="14" :stroke="2.5" />{{ $t('contract.signed') }}
                </span>
                <span v-else key="wait" class="text-base-content/45">{{ $t('contract.pending') }}</span>
              </Transition>
            </p>
          </div>
        </div>
      </div>

      <!-- side action panel -->
      <aside class="space-y-4 lg:sticky lg:top-24 lg:h-fit">
        <Transition name="fade" mode="out-in">
          <!-- step 0-1: agree / info -->
          <div v-if="stage < 2" key="pre" class="card-soft p-5">
            <p class="kicker">{{ $t('contract.imzolash') }}</p>
            <p class="mt-2 text-sm leading-relaxed text-base-content/65">{{ $t('contract.readyText') }}</p>

            <!-- Sotuvchi hali tasdiqlamagan bo'lsa, xaridor imzolay olmaydi -->
            <template v-if="contract?.myRole === 'seller'">
              <button v-if="!contract.sellerSigned" class="btn btn-primary mt-5 w-full rounded-xl" @click="approve">
                <Icon name="check" :size="16" />{{ $t('contract.approve') }}
              </button>
              <p v-else class="mt-5 rounded-xl bg-success/10 p-3 text-center text-xs font-semibold text-success">
                {{ $t('contract.waitingBuyer') }}
              </p>
            </template>

            <template v-else>
              <button
                class="btn btn-primary mt-5 w-full rounded-xl"
                :disabled="!contract?.sellerSigned"
                @click="proceed"
              >
                <Icon name="key" :size="16" />{{ $t('contract.startSign') }}
              </button>
              <p v-if="!contract?.sellerSigned" class="mt-3 text-center text-xs text-base-content/50">
                {{ $t('contract.waitingSeller') }}
              </p>
            </template>

            <button class="mt-3 w-full text-center text-xs text-base-content/45 hover:text-error" @click="cancel">
              {{ $t('common.cancel') }}
            </button>
          </div>

          <!-- step 2: signing code -->
          <div v-else-if="stage === 2" key="code" class="card-soft p-5">
            <p class="kicker">{{ $t('contract.imzolash') }}</p>
            <h3 class="mt-1.5 text-lg font-extrabold">{{ $t('contract.codeTitle') }}</h3>
            <div class="mt-5 flex justify-center gap-2.5">
              <input
                v-for="i in 4"
                :key="i"
                :ref="(el) => (inputs[i - 1] = el)"
                v-model="digits[i - 1]"
                inputmode="numeric"
                maxlength="1"
                class="h-14 w-12 rounded-xl border border-base-300 text-center text-2xl font-extrabold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                @input="onDigit(i - 1, $event)"
                @keydown="onBackspace(i - 1, $event)"
              />
            </div>
            <p class="mt-4 text-center text-xs text-base-content/50">
              {{ $t('contract.codeSentTo', { phone: sentTo }) }}
            </p>
            <button
              class="mt-3 w-full text-center text-xs font-semibold transition"
              :class="cooldown === 0 ? 'text-primary hover:underline' : 'text-base-content/35'"
              :disabled="cooldown > 0"
              @click="proceed"
            >
              {{ cooldown > 0 ? $t('contract.resendIn', { s: cooldown }) : $t('auth.resend') }}
            </button>
            <p v-if="actionError" class="mt-3 rounded-xl bg-error/10 p-2.5 text-xs font-semibold text-error">
              {{ actionError }}
            </p>
          </div>

          <!-- step 3: done -->
          <div v-else key="done" class="card-soft overflow-hidden p-5">
            <div class="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-success/15 text-success animate-pop-in">
              <Icon name="check" :size="26" :stroke="2.4" />
            </div>
            <p class="mt-4 text-center text-sm font-bold">{{ $t('contract.generated') }}</p>
            <div class="mt-5 space-y-2">
              <button class="btn btn-outline w-full rounded-xl" @click="downloadPdf">
                <Icon name="doc" :size="16" />PDF
              </button>
              <RouterLink :to="{ name: 'listing', params: { id: l.id } }" class="btn btn-primary w-full rounded-xl">
                {{ $t('common.close') }}
              </RouterLink>
            </div>
          </div>
        </Transition>

        <div class="rounded-2xl border border-base-300 p-4">
          <p class="label-x">{{ $t('contract.status') }}</p>
          <ul class="mt-2 space-y-2.5 text-sm">
            <li class="flex items-center gap-2.5">
              <span
                class="grid h-5 w-5 place-items-center rounded-full transition-colors duration-300"
                :class="sellerSigned ? 'bg-success/15 text-success' : 'bg-base-200'"
              >
                <Icon v-if="sellerSigned" name="check" :size="11" :stroke="3" />
              </span>
              <span :class="!sellerSigned && 'text-base-content/50'">
                {{ sellerSigned ? $t('contract.sellerSigned') : $t('contract.waitingSeller') }}
              </span>
            </li>
            <li class="flex items-center gap-2.5">
              <span
                class="grid h-5 w-5 place-items-center rounded-full transition-colors duration-300"
                :class="buyerSigned ? 'bg-success/15 text-success' : 'bg-base-200'"
              >
                <Icon v-if="buyerSigned" name="check" :size="11" :stroke="3" />
              </span>
              <span :class="!buyerSigned && 'text-base-content/50'">
                {{ buyerSigned ? $t('contract.buyerSignedLabel') : $t('contract.buyerPending') }}
              </span>
            </li>
          </ul>
          <div class="mt-4 flex items-center justify-between border-t border-base-200 pt-3">
            <span class="text-xs text-base-content/55">{{ $t('contract.fee') }}</span>
            <span class="text-sm font-bold">{{ $t('contract.feeVal') }}</span>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <div v-else-if="loading" class="container-x max-w-5xl py-12">
    <div class="skeleton-img h-10 w-1/2 rounded-xl"></div>
    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div class="skeleton-img h-96 rounded-3xl"></div>
      <div class="skeleton-img h-56 rounded-3xl"></div>
    </div>
  </div>

  <div v-else class="container-x flex flex-col items-center py-24 text-center">
    <p class="mt-6 text-xl font-bold">{{ loadError || $t('listing.notFound') }}</p>
    <RouterLink to="/search" class="btn btn-primary mt-6 rounded-xl">{{ $t('fav.goSearch') }}</RouterLink>
  </div>
</template>
