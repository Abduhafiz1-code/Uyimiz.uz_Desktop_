<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { contracts as contractsApi } from '@/api'
import { districtName, formatPrice } from '@/data/listings.js'
import BaseModal from './BaseModal.vue'
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: Boolean,
  listing: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])
const ui = useUiStore()
const auth = useAuthStore()
const router = useRouter()
const { t, locale } = useI18n()

const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const done = ref(false)
const busy = ref(false)
const error = ref('')
const contract = ref(null)

watch(open, (v) => {
  if (!v) {
    done.value = false
    error.value = ''
    contract.value = null
  }
})

const price = computed(() => (props.listing ? formatPrice(props.listing, locale.value) : null))

/**
 * Shartnoma so'rovini backendga yuboradi.
 *
 * Backend bu yerda qator tekshiruvlarni bajaradi (e'lon faolmi, xaridor
 * tasdiqlanganmi, boshqa shartnoma jarayondami) — xato bo'lsa uni
 * tushunarli matn bilan ko'rsatamiz.
 */
async function generate() {
  if (!props.listing || busy.value) return
  if (!auth.isAuthed) {
    ui.loginOpen = true
    ui.toast(t('auth.needLogin'), 'info')
    return
  }
  busy.value = true
  error.value = ''
  try {
    contract.value = await contractsApi.create(props.listing.id, {
      price: props.listing.price,
      currency: props.listing.currency,
      deal: props.listing.deal,
    })
    done.value = true
    ui.toast(t('contract.generated'))
  } catch (e) {
    error.value = e.message || t('common.netError')
  } finally {
    busy.value = false
  }
}

function openContract() {
  if (!contract.value) return
  open.value = false
  router.push({ name: 'contract', params: { id: contract.value.id } })
}

function downloadPdf() {
  if (contract.value?.pdfUrl) window.open(contract.value.pdfUrl, '_blank')
  else ui.toast(t('contract.pdfLater'), 'info')
}
</script>

<template>
  <BaseModal v-model="open" :title="$t('contract.title')" :subtitle="$t('contract.subtitle')" size="max-w-xl">
    <div v-if="listing" class="space-y-5">
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-base-300 p-4">
          <p class="label-x">{{ $t('contract.seller') }}</p>
          <p class="text-sm font-bold">{{ listing.owner }}</p>
          <p class="mt-1 flex items-center gap-1 text-xs text-primary">
            <Icon name="badge" :size="13" />{{ $t('card.verified') }}
          </p>
        </div>
        <div class="rounded-2xl border border-base-300 p-4">
          <p class="label-x">{{ $t('contract.buyer') }}</p>
          <p class="text-sm font-bold">{{ auth.user?.phone || '—' }}</p>
          <p class="mt-1 text-xs text-base-content/50">
            {{ auth.user?.verified ? $t('profile.verified') : $t('profile.notVerified') }}
          </p>
        </div>
      </div>

      <div class="rounded-2xl border border-base-300 p-4">
        <p class="label-x">{{ $t('contract.object') }}</p>
        <p class="text-sm font-semibold">
          {{ $t('card.rooms', { n: listing.rooms }) }} · {{ districtName(listing.district, locale) }},
          {{ listing.address }}
        </p>
        <div class="mt-3 flex items-center justify-between border-t border-base-200 pt-3">
          <span class="text-sm text-base-content/60">{{ $t('contract.price') }}</span>
          <span class="text-lg font-extrabold">{{ price.value }} {{ price.suffix }}</span>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-sm text-base-content/60">{{ $t('contract.fee') }}</span>
          <span class="text-sm font-bold">{{ $t('contract.feeVal') }}</span>
        </div>
      </div>

      <ol class="space-y-2.5">
        <li v-for="(s, i) in ['steps1', 'steps2', 'steps3']" :key="s" class="flex items-start gap-3">
          <span
            class="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs font-bold"
            :class="done ? 'bg-success/15 text-success' : 'bg-base-200 text-base-content/60'"
          >
            <Icon v-if="done" name="check" :size="13" :stroke="2.4" />
            <template v-else>{{ i + 1 }}</template>
          </span>
          <span class="pt-0.5 text-sm">{{ $t('contract.' + s) }}</span>
        </li>
      </ol>
    </div>

    <template #footer>
      <p v-if="error" class="mb-3 rounded-xl bg-error/10 p-3 text-xs font-semibold text-error">{{ error }}</p>
      <button v-if="!done" class="btn btn-primary w-full rounded-xl" :disabled="busy" @click="generate">
        <span v-if="busy" class="loading loading-spinner loading-sm"></span>
        <Icon v-else name="doc" :size="17" />{{ $t('contract.generate') }}
      </button>
      <div v-else class="flex gap-2">
        <button class="btn btn-outline flex-1 rounded-xl" @click="downloadPdf">
          <Icon name="doc" :size="16" />PDF
        </button>
        <button class="btn btn-primary flex-1 rounded-xl" @click="openContract">
          {{ $t('contract.openPage') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>
