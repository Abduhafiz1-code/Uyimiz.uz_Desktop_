/**
 * Ro'yxatdan o'tish va kirish — uchidan-uchiga.
 *
 * Bu testlar backend PROD sozlamalarida (DEBUG=0) va SMS'siz test
 * rejimida (OTP_TEST_MODE=1) ishlashini tekshiradi — ya'ni Render'dagi
 * holatga eng yaqin sharoitda.
 *
 *   VITE_API_BASE=http://127.0.0.1:8021 npx vitest run tests/auth.test.js
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { auth as authApi, favorites, getToken, setToken, ApiError } from '@/api'
import { useAuthStore } from '@/stores/auth'

/** Har safar yangi raqam — "ro'yxatdan o'tish" oqimini sinash uchun. */
function freshPhone() {
  const n = String(Math.floor(Math.random() * 900000000) + 100000000)
  return '+998' + n
}

describe('ro\'yxatdan o\'tish (yangi foydalanuvchi)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setToken('')
    localStorage.clear()
  })

  it('yangi raqam bilan kirish — akkaunt avtomatik yaratiladi', async () => {
    const phone = freshPhone()
    const store = useAuthStore()

    const sent = await store.sendCode(phone)
    expect(sent.demoCode, 'test rejimida kod javobda kelishi kerak').toMatch(/^\d{4}$/)

    const user = await store.verify(phone, sent.demoCode)
    expect(store.isAuthed).toBe(true)
    expect(user.id).toBeTruthy()
    expect(user.phone).toBe(phone)
    expect(user.role).toBeTruthy()
    expect(getToken()).toBeTruthy()
  })

  it('bir xil raqam ikkinchi marta kirsa — yangi akkaunt yaratilmaydi', async () => {
    const phone = freshPhone()

    const a = await authApi.sendCode(phone)
    const first = await authApi.verify(phone, a.demoCode)

    setToken('')
    const b = await authApi.sendCode(phone)
    const second = await authApi.verify(phone, b.demoCode)

    expect(second.user.id).toBe(first.user.id)
  })

  it('turli formatdagi raqamlar bir xil akkauntga tushadi', async () => {
    const digits = String(Math.floor(Math.random() * 900000000) + 100000000)

    const a = await authApi.sendCode('+998' + digits)
    const u1 = await authApi.verify('+998' + digits, a.demoCode)

    setToken('')
    // foydalanuvchi bo'shliq bilan yozsa ham
    const spaced = digits.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
    const b = await authApi.sendCode(spaced)
    const u2 = await authApi.verify(spaced, b.demoCode)

    expect(u2.user.id).toBe(u1.user.id)
  })
})

describe('kirishdagi xatolar to\'g\'ri ko\'rsatiladi', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setToken('')
    localStorage.clear()
  })

  it('noto\'g\'ri kod — tushunarli xabar', async () => {
    const phone = freshPhone()
    await authApi.sendCode(phone)

    await expect(authApi.verify(phone, '0000')).rejects.toSatisfy((e) => {
      expect(e).toBeInstanceOf(ApiError)
      expect(e.status).toBe(400)
      // foydalanuvchiga ko'rinadigan matn o'zbekcha bo'lishi kerak
      expect(e.message).toMatch(/[Kk]od/)
      expect(e.message).not.toMatch(/wrong_code|Bad Request/)
      return true
    })
  })

  it('noto\'g\'ri telefon raqami', async () => {
    await expect(authApi.sendCode('123')).rejects.toSatisfy((e) => {
      expect(e.status).toBe(400)
      expect(e.message).toMatch(/[Tt]elefon/)
      return true
    })
  })

  it('kod ikkinchi marta ishlatilmaydi', async () => {
    const phone = freshPhone()
    const sent = await authApi.sendCode(phone)
    await authApi.verify(phone, sent.demoCode)
    setToken('')
    await expect(authApi.verify(phone, sent.demoCode)).rejects.toMatchObject({ status: 400 })
  })
})

describe('sessiya', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setToken('')
    localStorage.clear()
  })

  it('kirgach himoyalangan endpoint ochiladi', async () => {
    const phone = freshPhone()
    const sent = await authApi.sendCode(phone)
    await authApi.verify(phone, sent.demoCode)

    const favs = await favorites.list()
    expect(Array.isArray(favs)).toBe(true)
  })

  it('chiqqandan keyin endpoint yopiladi', async () => {
    const phone = freshPhone()
    const store = useAuthStore()
    const sent = await store.sendCode(phone)
    await store.verify(phone, sent.demoCode)
    expect(store.isAuthed).toBe(true)

    await store.logout()
    expect(store.isAuthed).toBe(false)
    expect(store.hasToken).toBe(false)
    expect(getToken()).toBe('')
    await expect(favorites.list()).rejects.toMatchObject({ status: 401 })
  })

  it('yaroqsiz token — store o\'zini tozalaydi', async () => {
    const store = useAuthStore()
    setToken('yaroqsiz-token-12345')
    store.token = 'yaroqsiz-token-12345'

    const u = await store.refresh()
    expect(u).toBe(null)
    expect(store.isAuthed).toBe(false)
    expect(getToken()).toBe('')
  })

  it('sahifa yangilangandek — token bilan profil qayta yuklanadi', async () => {
    const phone = freshPhone()
    const first = useAuthStore()
    const sent = await first.sendCode(phone)
    await first.verify(phone, sent.demoCode)
    const savedToken = getToken()

    // yangi pinia = sahifa yangilandi
    setActivePinia(createPinia())
    setToken(savedToken)
    const second = useAuthStore()
    const u = await second.refresh()

    expect(u).toBeTruthy()
    expect(u.phone).toBe(phone)
    expect(second.isAuthed).toBe(true)
  })
})

describe('profil', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    setToken('')
    localStorage.clear()
    const phone = freshPhone()
    const sent = await authApi.sendCode(phone)
    await authApi.verify(phone, sent.demoCode)
  })

  it('ism va emailni yangilash', async () => {
    const store = useAuthStore()
    await store.refresh()
    const u = await store.updateProfile({ name: 'Ali Valiyev' })
    expect(u.name).toBe('Ali Valiyev')
    expect(store.user.name).toBe('Ali Valiyev')
  })

  it('shaxsni tasdiqlash', async () => {
    const store = useAuthStore()
    await store.refresh()
    expect(store.user.verified).toBe(false)
    const u = await store.verifyIdentity()
    expect(u.verified).toBe(true)
  })
})
