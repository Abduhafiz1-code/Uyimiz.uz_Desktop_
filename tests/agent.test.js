/**
 * Agent oqimi: ariza → admin tasdiqlashi → CRM ochilishi.
 *
 * Backend prod sozlamalarida ishlashi kerak:
 *   VITE_API_BASE=http://127.0.0.1:8041 npx vitest run tests/agent.test.js
 *
 * Bazada seed_demo bajarilgan bo'lishi kerak (admin hisobi uchun).
 */
import { beforeAll, describe, expect, it } from 'vitest'

import { setToken } from '@/api'
import { http } from '@/api/client.js'

const ADMIN = { phone: '+998900000001', password: 'admin12345' }

function yangiRaqam() {
  return '+998' + String(Math.floor(Math.random() * 900000000) + 100000000)
}

/** OTP bilan kirib token oladi. */
async function kir(phone) {
  setToken('')
  const sent = await http.post('/auth/send-code', { phone }, { auth: false })
  const res = await http.post(
    '/auth/verify',
    { phone, code: sent.demoCode },
    { auth: false }
  )
  setToken(res.token)
  return res
}

async function adminTokenOl() {
  setToken('')
  const res = await http.post('/auth/login/', ADMIN, { auth: false })
  return res.token
}

describe('agent arizasi va tasdiqlash', () => {
  const phone = yangiRaqam()
  let adminToken = ''
  let agentToken = ''
  let agentId = null

  beforeAll(async () => {
    adminToken = await adminTokenOl()
    expect(adminToken, 'seed_demo bajarilgan bo\'lishi kerak').toBeTruthy()
  })

  it('1. yangi foydalanuvchi kiradi — roli "user"', async () => {
    const res = await kir(phone)
    agentToken = res.token
    expect(res.role).toBe('user')
    expect(res.certification).toBeDefined()
  })

  it('2. oddiy foydalanuvchi CRM ga kira olmaydi', async () => {
    setToken(agentToken)
    await expect(http.get('/crm/dashboard/')).rejects.toMatchObject({ status: 403 })
  })

  it('3. ariza topshiradi — roli "agent", holati "Kutilmoqda"', async () => {
    setToken(agentToken)
    const res = await http.post('/auth/agent-apply', {
      name: 'Test Agent Ismi',
      district: 'Chilonzor',
      historical_deals: 7,
    })
    expect(res.role).toBe('agent')
    expect(res.certification).toBe('Kutilmoqda')
    expect(res.canEnterCrm).toBe(false)
  })

  it('4. ariza kutayotganda CRM hamon yopiq', async () => {
    setToken(agentToken)
    await expect(http.get('/crm/dashboard/')).rejects.toSatisfy((e) => {
      expect(e.status).toBe(403)
      // xato matni foydalanuvchiga tushunarli bo'lsin
      expect(e.message).toMatch(/ko'rib chiqilmoqda|Admin tasdiqlagach/)
      return true
    })
  })

  it('5. holatni qayta o\'qish (GET) ishlaydi', async () => {
    setToken(agentToken)
    const res = await http.get('/auth/agent-apply')
    expect(res.certification).toBe('Kutilmoqda')
    expect(res.canEnterCrm).toBe(false)
    expect(res.user.name).toBe('Test Agent Ismi')
  })

  it('6. takroriy ariza yangi yozuv yaratmaydi', async () => {
    setToken(agentToken)
    const res = await http.post('/auth/agent-apply', {
      name: 'Boshqa Ism',
      district: 'Sergeli',
    })
    // Navbatdagi ariza o'zgartirilmaydi
    expect(res.certification).toBe('Kutilmoqda')
    expect(res.user.name).toBe('Test Agent Ismi')
  })

  it('7. admin arizani ro\'yxatda ko\'radi', async () => {
    setToken(adminToken)
    const list = await http.get('/admin/agents/')
    const meniki = list.find((a) => a.phone === phone)
    expect(meniki, 'ariza admin ro\'yxatida ko\'rinishi kerak').toBeTruthy()
    expect(meniki.certification).toBe('Kutilmoqda')
    agentId = meniki.id
  })

  it('8. admin tasdiqlaydi', async () => {
    setToken(adminToken)
    const res = await http.patch(`/admin/agents/${agentId}/approve/`)
    expect(res.certification).toBe('Tasdiqlangan')
  })

  it('9. endi agent CRM ga kira oladi', async () => {
    setToken(agentToken)
    for (const yol of ['/crm/dashboard/', '/crm/clients/', '/crm/deals/']) {
      const res = await http.get(yol)
      expect(res, `${yol} ochilishi kerak`).toBeTruthy()
    }
  })

  it('10. holat "canEnterCrm: true" ga o\'tdi', async () => {
    setToken(agentToken)
    const res = await http.get('/auth/agent-apply')
    expect(res.certification).toBe('Tasdiqlangan')
    expect(res.canEnterCrm).toBe(true)
  })

  it('11. tasdiqlangan agent qayta ariza topshira olmaydi', async () => {
    setToken(agentToken)
    await expect(
      http.post('/auth/agent-apply', { name: 'Yana Ism', district: 'Mirobod' })
    ).rejects.toMatchObject({ status: 400, code: 'already_agent' })
  })

  it('12. admin sertifikatni bekor qilsa — CRM yana yopiladi', async () => {
    setToken(adminToken)
    await http.patch(`/admin/agents/${agentId}/revoke/`)

    setToken(agentToken)
    await expect(http.get('/crm/dashboard/')).rejects.toMatchObject({ status: 403 })
  })

  it('13. agent admin paneliga kira olmaydi', async () => {
    setToken(adminToken)
    await http.patch(`/admin/agents/${agentId}/approve/`)

    setToken(agentToken)
    await expect(http.get('/admin/users/')).rejects.toMatchObject({ status: 403 })
  })
})

describe('ariza formasi tekshiruvlari', () => {
  beforeAll(async () => {
    await kir(yangiRaqam())
  })

  it('qisqa ism qabul qilinmaydi', async () => {
    await expect(
      http.post('/auth/agent-apply', { name: 'Ab', district: 'Chilonzor' })
    ).rejects.toMatchObject({ status: 400 })
  })

  it('hudud majburiy', async () => {
    await expect(
      http.post('/auth/agent-apply', { name: 'To\'liq Ism', district: '' })
    ).rejects.toMatchObject({ status: 400 })
  })

  it('kirmagan foydalanuvchi ariza topshira olmaydi', async () => {
    setToken('')
    await expect(
      http.post('/auth/agent-apply', { name: 'To\'liq Ism', district: 'Chilonzor' })
    ).rejects.toMatchObject({ status: 401 })
  })
})
