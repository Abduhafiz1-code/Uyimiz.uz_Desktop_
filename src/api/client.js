// Uyimiz.uz — backend bilan ishlash uchun yagona qatlam.
//
// VITE_API_BASE — backendning ildiz manzili (masalan
// https://uyimiz-backend.onrender.com). Dev'da bo'sh qoldiriladi va
// vite.config.js dagi proxy 127.0.0.1:8000 ga yo'naltiradi.

const ROOT = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '')

export const API_ROOT = ROOT
const API = `${ROOT}/api`

const TOKEN_KEY = 'uyimiz.token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t)
  else localStorage.removeItem(TOKEN_KEY)
}

/** Nisbiy media yo'lini (/media/...) to'liq manzilga aylantiradi. */
export function mediaUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${ROOT}${path.startsWith('/') ? '' : '/'}${path}`
}

/** Backend qaytaradigan xato kodlarini o'zbekcha matnga o'giradi. */
const ERRORS = {
  invalid_phone: "Telefon raqami noto'g'ri kiritilgan",
  wrong_code: "Kod noto'g'ri",
  code_expired: "Kod muddati tugadi — yangisini so'rang",
  code_not_found: "Kod topilmadi — qaytadan so'rang",
  too_many_attempts: "Juda ko'p urinish. Yangi kod so'rang",
  too_soon: "Yangi kod so'rash uchun biroz kuting",
  account_blocked: "Hisobingiz bloklangan. Qo'llab-quvvatlash bilan bog'laning",
  same_phone: 'Bu allaqachon sizning raqamingiz',
  phone_taken: 'Bu raqam boshqa hisobga biriktirilgan',
  no_file: 'Fayl tanlanmadi',
  own_listing: "O'z e'loningizga shartnoma tuza olmaysiz",
  listing_not_active: "E'lon hozir faol emas",
  listing_dealt: "Bu uy bo'yicha bitim allaqachon yopilgan",
  docs_not_ready: "E'lon hujjatlari hali rasmiylashtirilmoqda",
  buyer_not_verified: 'Avval shaxsingizni tasdiqlang',
  seller_not_verified: 'Sotuvchi hali tasdiqlanmagan',
  contract_in_progress: "Bu e'lon bo'yicha boshqa xaridor bilan shartnoma jarayonda",
  seller_not_approved: 'Sotuvchi hali shartnomani tasdiqlamadi',
  contract_cancelled: 'Shartnoma bekor qilingan',
  already_signed: 'Shartnoma allaqachon imzolangan',
  only_seller: 'Bu amalni faqat sotuvchi bajara oladi',
  only_buyer: 'Bu amalni faqat xaridor bajara oladi',
  code_required: 'Tasdiqlash kodini kiriting',
  forbidden: "Bu amalga ruxsat yo'q",
  not_found: "Ma'lumot topilmadi",
}

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function messageFrom(data, status) {
  if (!data) return `So'rov xatosi (${status})`
  if (typeof data === 'string') return data
  const code = data.error || data.code
  if (code && ERRORS[code]) return ERRORS[code]
  if (typeof data.detail === 'string') return data.detail
  if (typeof data.error === 'string') return data.error
  const firstKey = Object.keys(data)[0]
  if (firstKey) {
    const val = data[firstKey]
    const msg = Array.isArray(val) ? val[0] : val
    if (typeof msg === 'string') return msg
  }
  return `So'rov xatosi (${status})`
}

let onUnauthorized = null
/** Auth store 401 bo'lganda chaqiriladigan funksiyani shu yerga bog'laydi. */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

async function request(path, { method = 'GET', body, form, signal, auth = true } = {}) {
  const headers = {}
  const token = getToken()
  if (auth && token) headers['Authorization'] = `Token ${token}`

  let payload
  if (form) {
    payload = form // FormData — Content-Type ni brauzer o'zi qo'yadi
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(`${API}${path}`, { method, headers, body: payload, signal })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new ApiError(0, 'network', "Serverga ulanib bo'lmadi. Internetni tekshiring.")
  }

  if (res.status === 401) {
    setToken('')
    if (onUnauthorized) onUnauthorized()
  }

  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const code = (data && (data.error || data.code)) || String(res.status)
    throw new ApiError(res.status, code, messageFrom(data, res.status))
  }
  return data
}

function qs(params) {
  const sp = new URLSearchParams()
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '' || v === false) return
    if (Array.isArray(v)) {
      if (v.length) sp.set(k, v.join(','))
    } else {
      sp.set(k, String(v))
    }
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}

export const http = {
  get: (path, params, opts) => request(`${path}${qs(params)}`, { ...opts }),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  patch: (path, body, opts) => request(path, { method: 'PATCH', body, ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body, ...opts }),
  del: (path, opts) => request(path, { method: 'DELETE', ...opts }),
  upload: (path, form, opts) => request(path, { method: 'POST', form, ...opts }),
}

export default http
