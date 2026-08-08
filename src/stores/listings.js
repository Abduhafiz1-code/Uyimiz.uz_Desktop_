import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { listings as listingsApi, favorites as favApi, districts as districtsApi, filtersToParams } from '@/api'
import { AGENTS, NEWBUILDS } from '@/data/listings.js'
import { useAuthStore } from './auth'

// Eslatma: filtrlash, saralash va sahifalash endi SERVER tomonda bajariladi
// (backend `/api/listings/` shu parametrlarni qabul qiladi). Shuning uchun
// `filtered`/`paged` computed'lari o'rniga `items` va `total` serverdan keladi.
// Komponentlar uchun nomlar avvalgidek qoldirildi.

export const emptyFilters = () => ({
  q: '',
  deal: 'sale',
  district: '',
  rooms: [],
  priceMin: null,
  priceMax: null,
  areaMin: null,
  verified: false,
  ownerOnly: false,
  withAgent: false,
  contractReady: false,
  metro: false,
  furnished: false,
  newBuilding: false,
})

export const useListingsStore = defineStore('listings', () => {
  const auth = useAuthStore()

  const items = ref([])
  const total = ref(0)
  const pageCount = ref(1)
  const loading = ref(false)
  const error = ref('')

  const myAds = ref([])
  const favorites = ref([]) // faqat id'lar
  const favItems = ref([]) // to'liq e'lonlar
  const districtList = ref([])

  const filters = ref(emptyFilters())
  const sort = ref('new')
  const page = ref(1)
  const perPage = ref(12)
  const showMap = ref(true)

  // Bitta e'lon sahifasi uchun kesh — orqaga qaytganda qayta yuklamaslik.
  const cache = ref(new Map())

  let reqId = 0

  /** Serverdan ro'yxatni yuklaydi. */
  async function fetchList() {
    const my = ++reqId
    loading.value = true
    error.value = ''
    try {
      const params = filtersToParams(filters.value, {
        sort: sort.value,
        page: page.value,
        perPage: perPage.value,
      })
      const res = await listingsApi.list(params)
      if (my !== reqId) return // eskirgan javob — e'tiborsiz qoldiramiz
      items.value = applyClientFilters(res.items)
      total.value = res.total
      pageCount.value = res.pageCount
      res.items.forEach((l) => cache.value.set(String(l.id), l))
    } catch (e) {
      if (my !== reqId) return
      error.value = e.message || "E'lonlarni yuklab bo'lmadi"
      items.value = []
      total.value = 0
      pageCount.value = 1
    } finally {
      if (my === reqId) loading.value = false
    }
  }

  /**
   * Backend qo'llab-quvvatlamaydigan filtrlar mijoz tomonda qo'llanadi.
   * (areaMin, features, contractReady, withAgent, ko'p tanlangan xonalar)
   */
  function applyClientFilters(list) {
    const f = filters.value
    return list.filter((l) => {
      if (f.areaMin != null && l.area < f.areaMin) return false
      if (f.withAgent && !l.byAgent) return false
      if (f.contractReady && !l.contractReady) return false
      if (f.metro && !l.features.includes('metro')) return false
      if (f.furnished && !l.features.includes('furnished')) return false
      if (f.newBuilding && (l.year == null || l.year < 2019)) return false
      if (Array.isArray(f.rooms) && f.rooms.length > 1) {
        const hit = f.rooms.some((r) => (r === 4 ? l.rooms >= 4 : l.rooms === r))
        if (!hit) return false
      }
      return true
    })
  }

  // Filtr, saralash yoki sahifa o'zgarsa — qayta so'rov.
  watch(
    () => [JSON.stringify(filters.value), sort.value, perPage.value],
    () => {
      page.value = 1
      fetchList()
    }
  )
  watch(page, fetchList)

  /** Bitta e'lon (avval keshdan, keyin serverdan). */
  async function fetchOne(id) {
    const key = String(id)
    if (cache.value.has(key)) return cache.value.get(key)
    const l = await listingsApi.byId(id)
    if (l) cache.value.set(key, l)
    return l
  }

  /** Sinxron variant — faqat keshdagi ma'lumotni beradi. */
  function byId(id) {
    return cache.value.get(String(id)) || items.value.find((l) => String(l.id) === String(id)) || null
  }

  async function fetchDistricts() {
    try {
      districtList.value = await districtsApi.list()
    } catch {
      districtList.value = []
    }
  }

  // ───────────────────── sevimlilar ─────────────────────

  async function fetchFavorites() {
    if (!auth.hasToken) {
      favorites.value = []
      favItems.value = []
      return
    }
    try {
      const list = await favApi.list()
      favItems.value = list
      favorites.value = list.map((l) => l.id)
    } catch {
      /* jim o'tkazamiz — sevimlilar ikkilamchi funksiya */
    }
  }

  /** Qo'shadi/olib tashlaydi. Kirmagan bo'lsa false qaytaradi. */
  async function toggleFav(id) {
    if (!auth.hasToken) return null
    const res = await favApi.toggle(id)
    favorites.value = res.ids
    if (!res.added) favItems.value = favItems.value.filter((l) => l.id !== id)
    else {
      const l = byId(id)
      if (l && !favItems.value.some((x) => x.id === id)) favItems.value.push(l)
    }
    return res.added
  }

  function isFav(id) {
    return favorites.value.includes(id)
  }

  const favListings = computed(() => favItems.value)

  async function clearFav() {
    for (const id of [...favorites.value]) {
      try {
        await favApi.toggle(id)
      } catch {
        /* davom etamiz */
      }
    }
    favorites.value = []
    favItems.value = []
  }

  // ───────────────────── mening e'lonlarim ─────────────────────

  async function fetchMyAds() {
    if (!auth.hasToken) {
      myAds.value = []
      return
    }
    try {
      myAds.value = (await listingsApi.mine()).map((l) => ({ ...l, mine: true }))
    } catch {
      myAds.value = []
    }
  }

  /** Yangi e'lon joylaydi; `photos` — File[] (ixtiyoriy). */
  async function addAd(ad, photoFiles = []) {
    const created = await listingsApi.create(ad)
    if (created && photoFiles.length) {
      try {
        await listingsApi.uploadPhotos(created.id, photoFiles)
      } catch {
        /* rasm yuklanmasa ham e'lon yaratilgan */
      }
    }
    await fetchMyAds()
    return created
  }

  async function removeAd(id) {
    await listingsApi.remove(id)
    myAds.value = myAds.value.filter((a) => a.id !== id)
  }

  // ───────────────────── yordamchilar ─────────────────────

  /** O'xshash e'lonlar — shu tuman yoki shu xonadagi boshqa e'lonlar. */
  async function similar(l, n = 3) {
    if (!l) return []
    try {
      const res = await listingsApi.list({
        deal: l.deal,
        district: l.district,
        perPage: n + 1,
        page: 1,
        sort: 'new',
      })
      return res.items.filter((x) => x.id !== l.id).slice(0, n)
    } catch {
      return []
    }
  }

  function resetFilters() {
    const deal = filters.value.deal
    filters.value = { ...emptyFilters(), deal }
  }

  // Bosh sahifa bloklari
  const featured = ref([])
  const latest = ref([])

  async function fetchHome() {
    try {
      const [f, l] = await Promise.all([
        listingsApi.list({ verified: 1, perPage: 6, page: 1, sort: 'new' }),
        listingsApi.list({ perPage: 3, page: 1, sort: 'new' }),
      ])
      featured.value = f.items
      latest.value = l.items
      f.items.concat(l.items).forEach((x) => cache.value.set(String(x.id), x))
    } catch {
      featured.value = []
      latest.value = []
    }
  }

  // Agentlar va yangi binolar uchun backendda ochiq endpoint yo'q
  // (`/api/crm/...` faqat agent roli uchun). Shuning uchun bu ikki bo'lim
  // hozircha statik ma'lumot bilan ishlaydi — backendga endpoint
  // qo'shilgach shu ikki qatorni almashtirish yetarli.
  const agents = computed(() => AGENTS)
  const newbuilds = computed(() => NEWBUILDS)

  // Eski komponentlar shu nomlarni o'qiydi.
  const all = computed(() => items.value)
  const filtered = computed(() => items.value)
  const paged = computed(() => items.value)
  const ownerCount = computed(() => items.value.filter((l) => !l.byAgent).length)
  const agentCount = computed(() => items.value.filter((l) => l.byAgent).length)

  return {
    items, all, filtered, paged, total, pageCount, loading, error,
    myAds, favorites, filters, sort, page, perPage, showMap,
    districtList, ownerCount, agentCount, featured, latest, agents, newbuilds,
    fetchList, fetchOne, fetchDistricts, fetchFavorites, fetchMyAds, fetchHome,
    byId, resetFilters, toggleFav, isFav, favListings, clearFav,
    addAd, removeAd, similar,
  }
})
