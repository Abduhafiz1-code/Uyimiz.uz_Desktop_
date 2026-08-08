// Backend endpointlarining yagona ro'yxati.
// Komponentlar to'g'ridan-to'g'ri fetch yozmaydi — shu yerdagi funksiyalarni chaqiradi.

import { http, setToken } from './client.js'
import {
  adaptContract,
  adaptDistricts,
  adaptListPage,
  adaptListing,
  adaptMessage,
  adaptThread,
  adaptUser,
} from './adapters.js'

export { ApiError, mediaUrl, getToken, setToken, setUnauthorizedHandler, API_ROOT } from './client.js'

// ─────────────────────────── Auth ───────────────────────────

export const auth = {
  /** OTP kod yuborish. purpose: 'login' | 'phone_change' */
  sendCode: (phone, purpose = 'login') =>
    http.post('/auth/send-code', { phone, purpose }, { auth: false }),

  /** Kodni tekshirish — token qaytaradi va saqlaydi. */
  async verify(phone, code) {
    const res = await http.post('/auth/verify', { phone, code }, { auth: false })
    if (res?.token) setToken(res.token)
    return { token: res?.token || '', user: adaptUser(res) }
  },

  /** Parol bilan kirish (agent/admin). */
  async login(phone, password) {
    const res = await http.post('/auth/login/', { phone, password }, { auth: false })
    if (res?.token) setToken(res.token)
    return { token: res?.token || '', user: adaptUser(res) }
  },

  async me() {
    return adaptUser(await http.get('/auth/me'))
  },

  async updateMe(data) {
    return adaptUser(await http.patch('/auth/me', data))
  },

  async uploadAvatar(file) {
    const form = new FormData()
    form.append('avatar', file)
    return adaptUser(await http.upload('/auth/me/avatar', form))
  },

  async logout() {
    try {
      await http.post('/auth/logout')
    } finally {
      setToken('')
    }
  },
}

// ────────────────────────── Tumanlar ──────────────────────────

export const districts = {
  async list() {
    return adaptDistricts(await http.get('/districts'))
  },
}

// ────────────────────────── E'lonlar ──────────────────────────

/** Store filtrlarini backend query parametrlariga o'giradi. */
export function filtersToParams(f = {}, { sort = 'new', page = 1, perPage = 12 } = {}) {
  const p = { page, perPage, sort }
  if (f.q) p.q = f.q.trim()
  if (f.deal) p.deal = f.deal
  if (f.district) p.district = f.district
  // Backend bitta `rooms` qabul qiladi; ko'p tanlangan bo'lsa eng kichigi
  // yuboriladi va qolgani mijoz tomonda filtrlanadi.
  if (Array.isArray(f.rooms) && f.rooms.length === 1) p.rooms = f.rooms[0]
  if (f.priceMin != null) p.priceMin = f.priceMin
  if (f.priceMax != null) p.priceMax = f.priceMax
  if (f.verified) p.verified = 1
  if (f.ownerOnly) p.ownerOnly = 1
  return p
}

export const listings = {
  async list(params, opts) {
    return adaptListPage(await http.get('/listings/', params, opts))
  },

  /**
   * Bitta e'lon.
   * Diqqat: backend bu endpointda javobni `{listing: {...}}` ichida
   * o'rab qaytaradi (ro'yxatdan farqli) — shuni ochib beramiz.
   */
  async byId(id, opts) {
    const res = await http.get(`/listings/${id}/`, null, opts)
    return adaptListing(res?.listing ?? res)
  },

  async mine() {
    const res = await http.get('/me/listings')
    return adaptListPage(res).items
  },

  async create(data) {
    return adaptListing(await http.post('/listings/', data))
  },

  async update(id, data) {
    return adaptListing(await http.patch(`/listings/${id}/`, data))
  },

  async remove(id) {
    return http.del(`/listings/${id}/`)
  },

  /** Rasm yuklash: File[] */
  async uploadPhotos(id, files) {
    const form = new FormData()
    Array.from(files).forEach((f) => form.append('images', f))
    return http.upload(`/listings/${id}/photos/`, form)
  },
}

// ───────────────────────── Sevimlilar ─────────────────────────

export const favorites = {
  async list() {
    const res = await http.get('/favorites')
    return adaptListPage(res).items
  },

  /**
   * Qo'shadi yoki olib tashlaydi.
   * Backend {added: bool, favorites: [id]} qaytaradi — to'liq ro'yxat
   * kelgani qulay, store'ni bir zumda sinxronlaymiz.
   */
  async toggle(listingId) {
    const res = await http.post(`/favorites/${listingId}`)
    return { added: !!res?.added, ids: res?.favorites || [] }
  },
}

// ─────────────────────────── Chat ───────────────────────────

export const chat = {
  /**
   * Suhbat xabarlari. Backend {items: [...]} qaytaradi.
   *
   * Diqqat: e'lon egasi o'z e'lonini `with` parametrisiz ochsa, backend
   * xabarlar emas, suhbatlar RO'YXATINI qaytaradi. Shuning uchun
   * `withUserId` berilmasa va javob thread ko'rinishida bo'lsa, uni
   * alohida belgilaymiz.
   */
  async messages(listingId, withUserId = null) {
    const res = await http.get(
      `/listings/${listingId}/chat`,
      withUserId ? { with: withUserId } : null
    )
    const items = res?.items || []
    // Thread ro'yxatida `buyer` maydoni bo'ladi, xabarda esa `text`.
    const isThreadList = items.length > 0 && items[0] && 'buyer' in items[0]
    if (isThreadList) {
      return { kind: 'threads', threads: items.map(adaptThread), messages: [] }
    }
    return { kind: 'messages', threads: [], messages: items.map(adaptMessage) }
  },

  /** Xabar yuboradi; backend yangilangan to'liq ro'yxatni qaytaradi. */
  async send(listingId, text, withUserId = null) {
    const path = withUserId
      ? `/listings/${listingId}/chat?with=${withUserId}`
      : `/listings/${listingId}/chat`
    const res = await http.post(path, { text })
    return (res?.items || []).map(adaptMessage)
  },

  async myChats() {
    const res = await http.get('/me/chats')
    return (res?.items || []).map(adaptThread)
  },
}

// ───────────────────────── Shartnoma ─────────────────────────

export const contracts = {
  async create(listingId, data) {
    return adaptContract(await http.post(`/listings/${listingId}/contract`, data))
  },

  async byId(id) {
    return adaptContract(await http.get(`/contracts/${id}`))
  },

  async mine() {
    const res = await http.get('/me/contracts')
    return (res?.items || []).map(adaptContract)
  },

  async approve(id) {
    return adaptContract(await http.post(`/contracts/${id}/approve`))
  },

  async cancel(id, reason = '') {
    return adaptContract(await http.post(`/contracts/${id}/cancel`, { reason }))
  },

  /**
   * Imzolashdan oldin SMS kod so'rash.
   * Dev rejimida backend {demoCode} ni ham qaytaradi.
   */
  async signRequest(id) {
    return http.post(`/contracts/${id}/sign-request`)
  },

  async sign(id, code) {
    return adaptContract(await http.post(`/contracts/${id}/sign`, { code }))
  },
}

// ────────────────────────── Reyting ──────────────────────────

export const ratings = {
  async rate(contractId, { score, comment = '' }) {
    return http.post(`/ratings/contracts/${contractId}/rate`, { score, comment })
  },

  async ofUser(userId) {
    const res = await http.get(`/ratings/users/${userId}/ratings`)
    return res?.items || res?.results || res || []
  },
}

export default { auth, districts, listings, favorites, chat, contracts, ratings }
