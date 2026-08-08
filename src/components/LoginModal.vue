<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import BaseModal from './BaseModal.vue'
import Icon from './Icon.vue'

const ui = useUiStore()
const auth = useAuthStore()
const { t } = useI18n()

const step = ref(1)
const phone = ref('')
const code = ref('')
const error = ref('')
const busy = ref(false)
// DEBUG rejimidagi backend kodni qaytaradi — dev paytida qo'l bilan
// SMS kutmaslik uchun ekranda ko'rsatamiz. Prod'da bu hech qachon kelmaydi.
const demoCode = ref('')

const open = computed({
  get: () => ui.loginOpen,
  set: (v) => (ui.loginOpen = v),
})

watch(open, (v) => {
  if (!v) {
    step.value = 1
    phone.value = ''
    code.value = ''
    error.value = ''
    demoCode.value = ''
  }
})

const phoneOk = computed(() => phone.value.replace(/\D/g, '').length >= 9)

function format(e) {
  let d = e.target.value.replace(/\D/g, '').slice(0, 9)
  const p = []
  if (d.length) p.push(d.slice(0, 2))
  if (d.length > 2) p.push(d.slice(2, 5))
  if (d.length > 5) p.push(d.slice(5, 7))
  if (d.length > 7) p.push(d.slice(7, 9))
  phone.value = p.join(' ')
}

/** Backend +998XXXXXXXXX ko'rinishini kutadi. */
const fullPhone = computed(() => '+998' + phone.value.replace(/\D/g, ''))

async function sendCode() {
  if (!phoneOk.value || busy.value) return
  error.value = ''
  busy.value = true
  try {
    const res = await auth.sendCode(fullPhone.value)
    demoCode.value = res.demoCode || ''
    step.value = 2
  } catch (e) {
    error.value = e.message || "Kod yuborilmadi. Qaytadan urinib ko'ring."
  } finally {
    busy.value = false
  }
}

async function confirm() {
  if (code.value.replace(/\D/g, '').length < 4 || busy.value) return
  error.value = ''
  busy.value = true
  try {
    const u = await auth.verify(fullPhone.value, code.value.replace(/\D/g, ''))
    ui.toast(t('auth.welcome', { name: u.name || u.phone }))
    open.value = false
  } catch (e) {
    error.value = e.message || "Kod noto'g'ri"
  } finally {
    busy.value = false
  }
}

async function resend() {
  if (busy.value) return
  error.value = ''
  busy.value = true
  try {
    const res = await auth.sendCode(fullPhone.value)
    demoCode.value = res.demoCode || ''
    ui.toast(t('auth.sendCode'), 'info')
  } catch (e) {
    error.value = e.message || "Kod yuborilmadi"
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <BaseModal v-model="open" :title="$t('auth.title')" :subtitle="step === 1 ? $t('auth.subtitle') : ''" size="max-w-md">
    <div v-if="step === 1" class="space-y-4">
      <div>
        <label class="label-x">{{ $t('auth.phone') }}</label>
        <div class="flex items-center gap-2 rounded-xl border border-base-300 bg-base-100 px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <span class="text-sm font-bold text-base-content/60">+998</span>
          <input
            :value="phone"
            inputmode="numeric"
            placeholder="90 123 45 67"
            class="w-full bg-transparent py-3 text-sm outline-none"
            @input="format"
            @keyup.enter="sendCode"
          />
        </div>
      </div>
      <p v-if="error" class="rounded-xl bg-error/10 p-3 text-xs font-semibold text-error">{{ error }}</p>
      <button class="btn btn-primary w-full rounded-xl" :disabled="!phoneOk || busy" @click="sendCode">
        <span v-if="busy" class="loading loading-spinner loading-sm"></span>
        {{ $t('auth.sendCode') }}
      </button>
      <p class="flex items-start gap-2 rounded-xl bg-base-200 p-3 text-xs text-base-content/60">
        <Icon name="shield" :size="15" class="mt-px shrink-0" />
        {{ $t('auth.demoHint') }}
      </p>
    </div>

    <div v-else class="space-y-4">
      <div>
        <p class="text-sm font-bold">{{ $t('auth.codeTitle') }}</p>
        <p class="mt-1 text-sm text-base-content/60">
          {{ $t('auth.codeSubtitle', { phone: '+998 ' + phone }) }}
        </p>
      </div>
      <p v-if="demoCode" class="rounded-xl bg-info/10 p-3 text-center text-xs font-semibold text-info">
        Test rejimi — kod: <span class="text-base font-extrabold tracking-widest">{{ demoCode }}</span>
      </p>
      <input
        v-model="code"
        inputmode="numeric"
        maxlength="4"
        placeholder="0000"
        class="field text-center text-2xl font-extrabold tracking-[0.6em]"
        @keyup.enter="confirm"
      />
      <p v-if="error" class="rounded-xl bg-error/10 p-3 text-xs font-semibold text-error">{{ error }}</p>
      <button
        class="btn btn-primary w-full rounded-xl"
        :disabled="code.replace(/\D/g, '').length < 4 || busy"
        @click="confirm"
      >
        <span v-if="busy" class="loading loading-spinner loading-sm"></span>
        {{ $t('auth.confirm') }}
      </button>
      <div class="flex justify-between text-sm">
        <button class="font-semibold text-primary hover:underline" @click="step = 1">
          {{ $t('auth.changePhone') }}
        </button>
        <button class="text-base-content/50 hover:text-base-content disabled:opacity-40" :disabled="busy" @click="resend">
          {{ $t('auth.resend') }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>
