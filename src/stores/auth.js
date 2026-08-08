import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { auth as authApi, getToken, setToken, setUnauthorizedHandler } from '@/api'

const KEY = 'uyimiz.user'

function loadCached() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null')
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Sahifa yangilanganda profil keshdan ko'rsatiladi, keyin `refresh()`
  // backenddan haqiqiy holatni olib keladi.
  const user = ref(loadCached())

  // Tokenning reaktiv nusxasi. `getToken()` oddiy funksiya bo'lgani uchun
  // computed uni kuzata olmaydi — shuning uchun alohida ref.
  const token = ref(getToken())

  /**
   * `hasToken` — server so'rovlari uchun: token bor, profil hali
   * yuklanmagan bo'lishi mumkin.
   * `isAuthed` — shablonlar uchun: profil ham tayyor (`auth.user.name`
   * kabi joylar xato bermasligi uchun).
   *
   * Store'lardagi amallar `hasToken`ga tayanadi, aks holda profil
   * yuklanguncha bosilgan tugma jimgina ishlamay qoladi.
   */
  const hasToken = computed(() => !!token.value)
  const isAuthed = computed(() => !!user.value && !!token.value)
  const loading = ref(false)
  const sending = ref(false)
  const pendingPhone = ref('')

  watch(user, (v) => {
    if (v) localStorage.setItem(KEY, JSON.stringify(v))
    else localStorage.removeItem(KEY)
  })

  // Token eskirsa yoki bekor qilinsa — profilni tozalaymiz.
  setUnauthorizedHandler(() => {
    user.value = null
    token.value = ''
  })

  /** Telefonga OTP kod yuboradi. */
  async function sendCode(phone) {
    sending.value = true
    try {
      const res = await authApi.sendCode(phone)
      pendingPhone.value = phone
      // DEBUG rejimidagi backend kodni javobda qaytaradi — dev qulayligi uchun.
      return { ok: true, demoCode: res?.demoCode || null }
    } finally {
      sending.value = false
    }
  }

  /** Kodni tasdiqlaydi va profilni yuklaydi. */
  async function verify(phone, code) {
    loading.value = true
    try {
      const { user: u } = await authApi.verify(phone, code)
      token.value = getToken()
      user.value = u
      pendingPhone.value = ''
      return u
    } finally {
      loading.value = false
    }
  }

  /** Parol bilan kirish (agent/admin ham shu saytdan kira olsin). */
  async function loginWithPassword(phone, password) {
    loading.value = true
    try {
      const { user: u } = await authApi.login(phone, password)
      token.value = getToken()
      user.value = u
      return u
    } finally {
      loading.value = false
    }
  }

  /** Backenddan profilni qayta o'qiydi (sahifa ochilganda chaqiriladi). */
  async function refresh() {
    token.value = getToken()
    if (!token.value) {
      user.value = null
      return null
    }
    try {
      user.value = await authApi.me()
      return user.value
    } catch (e) {
      if (e?.status === 401) {
        user.value = null
        token.value = ''
      }
      return null
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // tarmoq xatosi bo'lsa ham lokal chiqish bajarilsin
      setToken('')
    }
    token.value = ''
    user.value = null
  }

  /** Ism, email va shunga o'xshash maydonlarni yangilaydi. */
  async function updateProfile(data) {
    user.value = await authApi.updateMe(data)
    return user.value
  }

  async function uploadAvatar(file) {
    user.value = await authApi.uploadAvatar(file)
    return user.value
  }

  /** Shaxsni tasdiqlash (myID o'rniga hozircha oddiy bayroq). */
  async function verifyIdentity() {
    user.value = await authApi.updateMe({ verify: true })
    return user.value
  }

  function setName(name) {
    return updateProfile({ name })
  }

  return {
    user, token, hasToken, isAuthed, loading, sending, pendingPhone,
    sendCode, verify, loginWithPassword, refresh, logout,
    updateProfile, uploadAvatar, verifyIdentity, setName,
  }
})
