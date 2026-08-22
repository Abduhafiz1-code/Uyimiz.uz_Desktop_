// Backend (Django, snake_case) javobini sayt komponentlari kutayotgan
// shaklga (camelCase) o'giradi. Shu qatlam borligi uchun view va
// komponentlarga deyarli tegilmadi — ular avvalgidek `l.byAgent`,
// `l.contractReady`, `l.rating` maydonlarini o'qiyveradi.

import { mediaUrl } from './client.js'

/** ISO sanadan "necha soat oldin" ni hisoblaydi (sort va "yangi" belgisi uchun). */
function hoursSince(iso) {
  if (!iso) return 9999
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return 9999
  return Math.max(0, Math.round((Date.now() - t) / 3600000))
}

/**
 * Backenddagi e'lonni sayt formatiga o'giradi.
 *
 * Backendda yo'q maydonlar (lat/lng, ownerSince, ownerAds) uchun xavfsiz
 * qiymat beriladi — xarita va profil bloklari xato bermasligi uchun.
 */
export function adaptListing(r) {
  if (!r) return null

  const photos = Array.isArray(r.photos)
    ? r.photos.map((p) => mediaUrl(typeof p === 'string' ? p : p.image)).filter(Boolean)
    : []

  const price = Number(r.price) || 0
  const area = Number(r.area) || 0

  return {
    id: r.id,
    deal: r.deal,
    district: r.district,
    address: r.address || '',
    price,
    currency: r.currency || (r.deal === 'rent' ? 'uzs' : 'usd'),
    rooms: Number(r.rooms) || 0,
    area,
    floor: r.floor ?? null,
    floors: r.floors ?? null,
    year: r.year ?? null,
    ptype: r.ptype || 'apartment',
    repair: r.repair || 'none',
    docs: r.docs || 'process',
    features: Array.isArray(r.features) ? r.features : [],

    verified: !!r.verified,
    byAgent: !!r.by_agent,
    agentId: r.agent ?? null,
    agentName: r.agent_name || null,
    contractReady: !!r.contract_ready,
    isNew: !!r.is_new,
    promoted: !!r.promoted,
    badge: r.badge || null,
    status: r.status || 'active',

    rating: r.rating_avg != null ? Number(r.rating_avg) : null,
    ratingCount: r.rating_count ?? 0,

    owner: r.owner_name || 'Uy egasi',
    ownerId: r.owner ?? null,
    ownerPhone: r.owner_phone || '',
    ownerVerified: !!r.owner_verified,
    // Backendda bu ikkisi yo'q — profil blokida bo'sh ko'rinmasligi uchun:
    ownerSince: r.created_at ? new Date(r.created_at).getFullYear() : null,
    ownerAds: null,

    views: r.views ?? 0,
    updatedH: hoursSince(r.updated_at || r.created_at),
    photos,
    description: r.description || '',
    isFavorite: !!r.is_favorite,

    // Xarita uchun koordinata backendda saqlanmaydi.
    lat: r.lat ?? null,
    lng: r.lng ?? null,

    mine: false,
    createdAt: r.created_at || null,
    updatedAt: r.updated_at || null,
  }
}

/** Sahifalangan javob: {items, total, page, perPage, pageCount}. */
export function adaptListPage(res) {
  if (!res) return { items: [], total: 0, page: 1, perPage: 12, pageCount: 1 }
  const raw = Array.isArray(res) ? res : res.items || res.results || []
  return {
    items: raw.map(adaptListing).filter(Boolean),
    total: res.total ?? res.count ?? raw.length,
    page: res.page ?? 1,
    perPage: res.perPage ?? 12,
    pageCount: res.pageCount ?? 1,
  }
}

/** Foydalanuvchi profili. */
export function adaptUser(r) {
  if (!r) return null
  const u = r.user || r
  return {
    id: u.id,
    phone: u.phone || '',
    name: u.name || 'Foydalanuvchi',
    email: u.email || '',
    role: u.role || 'user',
    verified: !!u.verified,
    // Backend `avatar_url` nomi bilan qaytaradi (`avatar` emas).
    avatar: u.avatar_url ? mediaUrl(u.avatar_url) : '',
    initials: u.initials || '',
    userKind: u.user_kind || '',
    userKindLabel: u.user_kind_label || '',
    district: u.district || '',
    joined: u.date_joined ? new Date(u.date_joined).getFullYear() : new Date().getFullYear(),
    rating: u.rating_avg != null ? Number(u.rating_avg) : null,
    ratingCount: u.rating_count ?? 0,
  }
}

/** Chat xabari. */
export function adaptMessage(r) {
  if (!r) return null
  return {
    id: r.id,
    threadId: r.thread,
    senderId: r.sender,
    senderName: r.sender_name || '',
    text: r.text || '',
    createdAt: r.created_at,
  }
}

/**
 * Chat mavzusi.
 *
 * Ikki turi bor:
 *   `kind === 'listing'` — e'lon bo'yicha suhbat (xaridor ↔ uy egasi)
 *   `kind === 'direct'`  — to'g'ridan-to'g'ri suhbat (masalan agent bilan)
 *
 * `peer*` maydonlari — SUHBATDOSH haqida. Backend ularni so'rov yuborgan
 * foydalanuvchiga qarab hisoblaydi, shuning uchun ekranda doim to'g'ri
 * ism chiqadi (ilgari e'lon egasi hamma joyda xaridorning ismini ko'rardi).
 */
export function adaptThread(r) {
  if (!r) return null
  return {
    id: r.id,
    kind: r.kind || (r.listing ? 'listing' : 'direct'),
    listingId: r.listing ?? null,
    listingTitle: r.listing_title || '',
    listingDistrict: r.listing_district || '',
    buyerId: r.buyer,
    buyerName: r.buyer_name || '',
    recipientId: r.recipient ?? null,

    peerId: r.peer_id ?? null,
    // Eski backendga tushib qolsa ham bo'sh qolmasin.
    peerName: r.peer_name || r.buyer_name || '',
    peerRole: r.peer_role || 'user',
    peerAvatar: r.peer_avatar ? mediaUrl(r.peer_avatar) : '',

    unread: r.unread ?? 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at || r.created_at,
    lastMessage: r.last_message ? adaptMessage(r.last_message) : null,
  }
}

/**
 * Uyimiz Agent (ommaviy katalog uchun).
 *
 * Diqqat: eski `AGENTS` mock massivida `ph` (rasm raqami) maydoni bor edi
 * va komponentlar `photo(a.ph)` ni chaqirardi. Endi haqiqiy avatar bo'lsa
 * o'shani, bo'lmasa ID asosidagi barqaror o'rin bosarni beramiz — shu
 * tufayli har yangilanishda rasm sakramaydi.
 */
export function adaptAgent(r) {
  if (!r) return null
  const rating = r.rating != null ? Number(r.rating) : 0
  return {
    id: r.id,
    name: r.name || 'Agent',
    phone: r.phone || '',
    district: r.district || '',
    initials: r.initials || '',
    avatar: r.avatar_url ? mediaUrl(r.avatar_url) : '',
    rating: Number.isFinite(rating) ? rating : 0,
    ratingCount: r.rating_count ?? 0,
    tier: r.tier || 'Yangi',
    deals: r.deals ?? 0,
    years: r.years ?? 0,
    top: !!r.top,
    responseMinutes: r.avg_response_minutes ?? 0,
    listingsCount: r.listings_count ?? 0,
    joined: r.date_joined || null,
    // Rasm o'rin bosari uchun barqaror urug'.
    ph: ((Number(r.id) || 0) % 28) + 1,
  }
}

/** Onlayn shartnoma. */
export function adaptContract(r) {
  if (!r) return null
  return {
    id: r.id,
    listingId: r.listing,
    listingAddress: r.listing_address || '',
    listingDistrict: r.listing_district || '',
    listingArea: r.listing_area != null ? Number(r.listing_area) : null,

    sellerId: r.seller,
    sellerName: r.seller_name || '',
    sellerPhone: r.seller_phone || '',
    buyerId: r.buyer,
    buyerName: r.buyer_name || '',
    buyerPhone: r.buyer_phone || '',
    agentId: r.agent ?? null,

    deal: r.deal,
    price: Number(r.price) || 0,
    currency: r.currency || 'usd',
    serviceFee: r.service_fee != null ? Number(r.service_fee) : 0,

    sellerSigned: !!r.seller_signed,
    buyerSigned: !!r.buyer_signed,
    status: r.status,
    statusLabel: r.status_label || '',
    myRole: r.my_role || null,
    canSign: !!r.can_sign,
    cancelReason: r.cancel_reason || '',

    pdfUrl: r.pdf_url ? mediaUrl(r.pdf_url) : null,
    createdAt: r.created_at,
    sellerApprovedAt: r.seller_approved_at,
    signedAt: r.signed_at,
  }
}

/** Tumanlar ro'yxati: [{id, name}]. */
export function adaptDistricts(res) {
  const items = res?.items || res?.results || res || []
  return items.map((d) => ({ id: d.id ?? d.slug, name: d.name }))
}
