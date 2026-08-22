<script setup>
import { ref, computed, nextTick, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { chat as chatApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import BaseModal from './BaseModal.vue'
import Icon from './Icon.vue'

/**
 * Chat oynasi ikki rejimda ishlaydi:
 *
 *   1. `listingId` berilgan  → e'lon bo'yicha suhbat (xaridor ↔ uy egasi)
 *   2. `peerId` berilgan     → to'g'ridan-to'g'ri suhbat (masalan agent bilan)
 *
 * Ilgari faqat 1-rejim bor edi va "Agentlar" sahifasi oynani hech qanday
 * `listingId`siz ochardi — natijada chat butunlay ishlamasdi (na yuklardi,
 * na yuborardi). Endi u `peerId` beradi.
 */
const props = defineProps({
  modelValue: Boolean,
  name: { type: String, default: '' },
  /** E'lon suhbati uchun. */
  listingId: { type: [Number, String], default: null },
  /** To'g'ridan-to'g'ri suhbat uchun (suhbatdoshning user ID'si). */
  peerId: { type: [Number, String], default: null },
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const auth = useAuthStore()

const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const text = ref('')
const messages = ref([])
const box = ref(null)
const loading = ref(false)
const sending = ref(false)
const error = ref('')

/** Suhbat qay usulda ochilishini aniqlaydi. */
const mode = computed(() => {
  if (props.listingId) return 'listing'
  if (props.peerId) return 'direct'
  return 'none'
})

/** Kirmagan foydalanuvchiga yozish tugmasi ko'rsatilmasin. */
const needsLogin = computed(() => !auth.hasToken)
const disabled = computed(() => needsLogin.value || mode.value === 'none')

let poll = null

function hhmm(iso) {
  const d = iso ? new Date(iso) : new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Backend xabarini ekran formatiga o'giradi. */
function toRow(m) {
  return {
    id: m.id,
    me: auth.user ? m.senderId === auth.user.id : false,
    text: m.text,
    time: hhmm(m.createdAt),
  }
}

async function scrollDown() {
  await nextTick()
  box.value?.scrollTo({ top: box.value.scrollHeight, behavior: 'smooth' })
}

function apply(res) {
  if (res.kind !== 'messages') return
  const before = messages.value.length
  messages.value = res.messages.map(toRow)
  if (messages.value.length !== before) scrollDown()
}

async function load({ silent = false } = {}) {
  if (disabled.value) return
  if (!silent) loading.value = true
  try {
    const res =
      mode.value === 'listing'
        ? await chatApi.messages(props.listingId)
        : await chatApi.direct(props.peerId)
    apply(res)
    error.value = ''
  } catch (e) {
    // Fon so'rovi yiqilsa foydalanuvchini bezovta qilmaymiz.
    if (!silent) error.value = e.message || t('common.netError')
  } finally {
    loading.value = false
  }
}

watch(open, (v) => {
  if (v) {
    messages.value = []
    error.value = ''
    load()
    // Yangi xabarlarni ko'rish uchun oddiy polling (WebSocket o'rniga).
    if (!disabled.value) poll = setInterval(() => load({ silent: true }), 8000)
  } else if (poll) {
    clearInterval(poll)
    poll = null
  }
})

// Suhbatdosh almashsa (masalan agentlar ro'yxatida boshqasiga bosilsa),
// oyna ochiq turgan bo'lsa ham yangi suhbat yuklanadi.
watch([() => props.listingId, () => props.peerId], () => {
  if (open.value) {
    messages.value = []
    load()
  }
})

onUnmounted(() => poll && clearInterval(poll))

async function send() {
  const v = text.value.trim()
  if (!v || sending.value || disabled.value) return
  sending.value = true
  error.value = ''
  const draft = v
  text.value = ''
  try {
    const res =
      mode.value === 'listing'
        ? await chatApi.send(props.listingId, draft)
        : await chatApi.sendDirect(props.peerId, draft)
    apply(res)
  } catch (e) {
    error.value = e.message || t('common.netError')
    text.value = draft // yuborilmagan matn yo'qolmasin
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <BaseModal v-model="open" :title="$t('chat.title', { name })" size="max-w-md">
    <div ref="box" class="max-h-[46vh] min-h-[8rem] space-y-3 overflow-y-auto pr-1">
      <div v-if="loading" class="space-y-3">
        <div class="skeleton-img h-10 w-2/3 rounded-2xl"></div>
        <div class="skeleton-img ml-auto h-10 w-1/2 rounded-2xl"></div>
      </div>

      <p v-else-if="needsLogin" class="py-8 text-center text-sm text-base-content/50">
        {{ $t('chat.loginFirst') }}
      </p>

      <p v-else-if="!messages.length" class="py-8 text-center text-sm text-base-content/50">
        {{ $t('chat.hint') }}
      </p>

      <div v-for="m in messages" :key="m.id" class="flex" :class="m.me ? 'justify-end' : 'justify-start'">
        <div
          class="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug"
          :class="m.me ? 'rounded-br-md bg-primary text-primary-content' : 'rounded-bl-md bg-base-200'"
        >
          {{ m.text }}
          <span class="mt-1 block text-[10px] opacity-60">{{ m.time }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <p v-if="error" class="mb-2 rounded-xl bg-error/10 p-2.5 text-xs font-semibold text-error">{{ error }}</p>
      <div class="flex items-center gap-2">
        <input
          v-model="text"
          class="field flex-1"
          :placeholder="needsLogin ? $t('chat.loginFirst') : $t('chat.placeholder')"
          :disabled="sending || disabled"
          @keyup.enter="send"
        />
        <button
          class="btn btn-primary rounded-xl px-3.5"
          :disabled="!text.trim() || sending || disabled"
          @click="send"
        >
          <span v-if="sending" class="loading loading-spinner loading-xs"></span>
          <Icon v-else name="telegram" :size="18" />
        </button>
      </div>
      <p class="mt-2 text-[11px] text-base-content/45">{{ $t('chat.hint') }}</p>
    </template>
  </BaseModal>
</template>
