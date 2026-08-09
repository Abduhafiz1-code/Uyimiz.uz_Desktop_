/**
 * Integratsiya testi — HAQIQIY backendga qarshi ishlaydi.
 *
 * Ishga tushirish:
 *   1) Backendni ko'taring:  cd uyimiz-backend && python manage.py runserver 8020
 *   2) VITE_API_BASE=http://127.0.0.1:8020 npx vitest run
 *
 * Bu test adapter, API qatlami va store'larni tekshiradi: backend
 * javobidagi maydon nomlari komponentlar kutayotgan nomlarga mos
 * o'girilyaptimi, store'lar to'g'ri holatga kelyaptimi.
 */
import { beforeAll, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { auth as authApi, districts, listings, favorites, chat, contracts, setToken } from '@/api'
import { adaptListing, adaptUser, adaptContract } from '@/api/adapters.js'
import { useAuthStore } from '@/stores/auth'
import { useListingsStore } from '@/stores/listings'

const BUYER = '+998904445566'

/** Komponentlar o'qiydigan maydonlar — biror biri yo'qolsa sayt buziladi. */
const LISTING_FIELDS = [
  'id', 'deal', 'district', 'address', 'price', 'currency', 'rooms', 'area',
  'features', 'verified', 'byAgent', 'contractReady', 'isNew', 'promoted',
  'rating', 'ratingCount', 'owner', 'views', 'updatedH', 'photos',
]

async function loginAs(phone) {
  const sent = await authApi.sendCode(phone)
  expect(sent.demoCode, 'backend DEBUG=1 rejimida ishlashi kerak').toBeTruthy()
  return authApi.verify(phone, sent.demoCode)
}

describe('backend bilan aloqa', () => {
  beforeAll(() => {
    setActivePinia(createPinia())
    setToken('')
  })

  it('tumanlar ro\'yxati keladi', async () => {
    const list = await districts.list()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)
    expect(list[0]).toHaveProperty('id')
    expect(list[0]).toHaveProperty('name')
  })

  it('e\'lonlar ro\'yxati adapterdan to\'g\'ri o\'tadi', async () => {
    const res = await listings.list({ page: 1, perPage: 5 })
    expect(res.items.length).toBeGreaterThan(0)
    expect(res.total).toBeGreaterThan(0)

    const l = res.items[0]
    for (const f of LISTING_FIELDS) {
      expect(l, `"${f}" maydoni yo'q — komponentlar buni o'qiydi`).toHaveProperty(f)
    }
    // snake_case qolib ketmasligi kerak
    expect(l).not.toHaveProperty('by_agent')
    expect(l).not.toHaveProperty('contract_ready')
    expect(Array.isArray(l.photos)).toBe(true)
    expect(typeof l.updatedH).toBe('number')
  })

  it('bitta e\'lon ochiladi', async () => {
    const res = await listings.list({ page: 1, perPage: 1 })
    const one = await listings.byId(res.items[0].id)
    expect(one.id).toBe(res.items[0].id)
    expect(one.owner).toBeTruthy()
  })

  it('filtr va saralash server tomonda ishlaydi', async () => {
    // Diqqat: pullik e'lonlar (VIP → Premium → Oddiy) har doim tepada
    // turadi — bu monetizatsiya mantig'i. Narx bo'yicha saralash har bir
    // guruh ICHIDA qo'llanadi, shuning uchun butun ro'yxatni emas,
    // guruhlar ichini tekshiramiz.
    const cheap = await listings.list({ sort: 'cheap', perPage: 20 })
    const guruhlar = new Map()
    for (const l of cheap.items) {
      const k = l.badge || 'oddiy'
      if (!guruhlar.has(k)) guruhlar.set(k, [])
      guruhlar.get(k).push(l.price)
    }
    for (const [badge, narxlar] of guruhlar) {
      const sorted = [...narxlar].sort((a, b) => a - b)
      expect(narxlar, `"${badge}" guruhi narx bo'yicha saralanmagan`).toEqual(sorted)
    }

    // Pullik e'lonlar oddiylardan oldin kelishi kerak
    const rank = { vip: 0, premium: 1 }
    const ranks = cheap.items.map((l) => rank[l.badge] ?? 2)
    expect(ranks, 'pullik e\'lonlar tepada bo\'lishi kerak').toEqual(
      [...ranks].sort((a, b) => a - b)
    )

    const sale = await listings.list({ deal: 'sale', perPage: 5 })
    expect(sale.items.every((l) => l.deal === 'sale')).toBe(true)
  })

  it('mehmon uchun himoyalangan endpoint yopiq', async () => {
    setToken('')
    await expect(favorites.list()).rejects.toMatchObject({ status: 401 })
  })
})

describe('auth store', () => {
  beforeAll(() => {
    setActivePinia(createPinia())
    setToken('')
    localStorage.clear()
  })

  it('OTP orqali kirish va profil yuklash', async () => {
    const store = useAuthStore()
    expect(store.isAuthed).toBe(false)

    const sent = await store.sendCode(BUYER)
    expect(sent.demoCode).toBeTruthy()

    const user = await store.verify(BUYER, sent.demoCode)
    expect(store.isAuthed).toBe(true)
    expect(user.phone).toBeTruthy()
    expect(user.name).toBeTruthy()
    // adaptUser avatar_url → avatar o'girishi
    expect(user).toHaveProperty('avatar')
  })

  it('refresh() profilni qayta o\'qiydi', async () => {
    const store = useAuthStore()
    const u = await store.refresh()
    expect(u).toBeTruthy()
    expect(u.id).toBeTruthy()
  })

  it('ismni yangilaydi', async () => {
    const store = useAuthStore()
    const u = await store.updateProfile({ name: 'Test Xaridor' })
    expect(u.name).toBe('Test Xaridor')
  })
})

describe('listings store', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    setToken('')
    localStorage.clear()
    const { token } = await loginAs(BUYER)
    expect(token).toBeTruthy()
  })

  it('fetchList() ro\'yxatni to\'ldiradi', async () => {
    const store = useListingsStore()
    await store.fetchList()
    expect(store.loading).toBe(false)
    expect(store.error).toBe('')
    expect(store.items.length).toBeGreaterThan(0)
    // eski komponentlar shu nomlarni o'qiydi
    expect(store.paged.length).toBe(store.items.length)
    expect(store.all.length).toBe(store.items.length)
    expect(store.total).toBeGreaterThan(0)
  })

  it('fetchHome() bosh sahifa bloklarini to\'ldiradi', async () => {
    const store = useListingsStore()
    await store.fetchHome()
    expect(Array.isArray(store.featured)).toBe(true)
    expect(Array.isArray(store.latest)).toBe(true)
  })

  it('fetchOne() va keshlash', async () => {
    const store = useListingsStore()
    await store.fetchList()
    const id = store.items[0].id
    const l = await store.fetchOne(id)
    expect(l.id).toBe(id)
    // ikkinchi marta keshdan kelishi kerak
    expect(store.byId(id)).toBeTruthy()
  })

  it('sevimlilar: qo\'shish → ro\'yxat → olib tashlash', async () => {
    const store = useListingsStore()
    await store.fetchList()
    const id = store.items[0].id

    const added = await store.toggleFav(id)
    expect(added).toBe(true)
    expect(store.isFav(id)).toBe(true)

    await store.fetchFavorites()
    expect(store.favListings.some((l) => l.id === id)).toBe(true)

    const removed = await store.toggleFav(id)
    expect(removed).toBe(false)
    expect(store.isFav(id)).toBe(false)
  })

  it('similar() o\'xshash e\'lonlarni qaytaradi', async () => {
    const store = useListingsStore()
    await store.fetchList()
    const sim = await store.similar(store.items[0], 3)
    expect(Array.isArray(sim)).toBe(true)
    expect(sim.every((s) => s.id !== store.items[0].id)).toBe(true)
  })
})

describe('chat', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    setToken('')
    await loginAs(BUYER)
  })

  it('xabar yuborish va o\'qish', async () => {
    const res = await listings.list({ perPage: 1 })
    const id = res.items[0].id

    const sent = await chat.send(id, 'Test xabar')
    expect(Array.isArray(sent)).toBe(true)
    expect(sent.at(-1).text).toBe('Test xabar')
    expect(sent.at(-1)).toHaveProperty('senderId')
    expect(sent.at(-1)).toHaveProperty('createdAt')

    const got = await chat.messages(id)
    expect(got.kind).toBe('messages')
    expect(got.messages.length).toBeGreaterThan(0)
  })
})

describe('shartnoma to\'liq oqimi', () => {
  let listingId
  let contractId
  let sellerPhone

  beforeAll(async () => {
    setActivePinia(createPinia())
    // Xaridor sifatida kiramiz va SOTUVCHISI aniq bo'lgan e'lonni
    // tanlaymiz — tasdiqlash bosqichida o'sha egasi bilan kirish uchun.
    // (Ilgari qat'iy telefon yozilgan edi; seed ma'lumoti o'zgarsa buzilardi.)
    await loginAs(BUYER)
    // Shartnoma faqat quyidagi shartlar bajarilganda tuziladi:
    //   • e'lon "active" (pending emas)
    //   • hujjatlari tayyor
    //   • egasi tasdiqlangan va bu xaridorning o'zi emas
    const res = await listings.list({ deal: 'sale', perPage: 50 })
    const nomzod = res.items.find(
      (l) =>
        l.status === 'active' &&
        l.contractReady &&
        l.docs === 'ready' &&
        l.ownerVerified &&
        l.ownerPhone &&
        l.ownerPhone !== BUYER
    )
    expect(nomzod, "shartnomaga yaroqli e'lon topilmadi").toBeTruthy()
    listingId = nomzod.id
    sellerPhone = nomzod.ownerPhone
  })

  it('xaridor shartnoma yaratadi', async () => {
    await loginAs(BUYER)
    const c = await contracts.create(listingId, { price: 50000, currency: 'usd', deal: 'sale' })
    expect(c.id).toBeTruthy()
    expect(c.myRole).toBe('buyer')
    expect(c.sellerSigned).toBe(false)
    expect(c.canSign).toBe(false)
    contractId = c.id
  })

  it('sotuvchi tasdiqlaydi', async () => {
    await loginAs(sellerPhone)
    const c = await contracts.approve(contractId)
    expect(c.sellerSigned).toBe(true)
    expect(c.myRole).toBe('seller')
    expect(c.status).toBe('awaiting_sign')
  })

  it('xaridor imzolaydi va PDF yaratiladi', async () => {
    await loginAs(BUYER)
    const req = await contracts.signRequest(contractId)
    expect(req.demoCode).toBeTruthy()

    const c = await contracts.sign(contractId, req.demoCode)
    expect(c.buyerSigned).toBe(true)
    expect(c.status).toBe('signed')
    expect(c.pdfUrl).toMatch(/\.pdf$/)
  })

  it('/me/contracts ro\'yxatida ko\'rinadi', async () => {
    const list = await contracts.mine()
    expect(list.some((c) => c.id === contractId)).toBe(true)
  })
})

describe('adapterlar (birlik)', () => {
  it('bo\'sh/yaroqsiz kirishda yiqilmaydi', () => {
    expect(adaptListing(null)).toBe(null)
    expect(adaptUser(null)).toBe(null)
    expect(adaptContract(null)).toBe(null)
  })

  it('rasmi yo\'q e\'lon ham to\'g\'ri o\'giriladi', () => {
    const l = adaptListing({ id: 1, deal: 'sale', district: 'x', price: '100', area: '50' })
    expect(l.photos).toEqual([])
    expect(l.price).toBe(100)
    expect(l.features).toEqual([])
    expect(l.rating).toBe(null)
  })
})
