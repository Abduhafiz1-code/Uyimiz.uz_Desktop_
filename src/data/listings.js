// Demo ma'lumotlar. Real loyihada bu API dan keladi.

export const PHOTOS = [
  '1560448204-e02f11c3d0e2', '1502672260266-1c1ef2d93688', '1522708323590-d24dbb6b0267',
  '1493809842364-78817add7ffb', '1524758631624-e2822e304c36', '1484154218962-a197022b5858',
  '1556909212-d5b604d0c90d', '1512917774080-9991f1c4c750', '1600585154340-be6161a56a0c',
  '1600596542815-ffad4c1539a9', '1600607687939-ce8a6c25118c', '1600566753086-00f18fb6b3ea',
  '1586023492125-27b2c045efd7', '1567767292278-a4f21aa2d36e', '1554995207-c18c203602cb',
  '1583608205776-bfd35f0d9f83', '1505873242700-f289a29e1e0f', '1560185127-6ed189bf02f4',
  '1545324418-cc1a3fa10c00', '1493663284031-b7e3aefcae8e', '1522771739844-6a9f6d5f14af',
  '1502005229762-cf1b2da7c5d6', '1416331108676-a22ccb276e35', '1449844908441-8829872d2607',
  '1570129477492-45c003edd2be', '1512918728675-ed5a9ecdebfd',
]

/**
 * Rasm manzili.
 *
 * Backendga ulangandan keyin `l.photos` ichida tayyor URL'lar keladi —
 * shu holda o'sha URL o'zgarishsiz qaytariladi. Agar raqam berilsa
 * (demo ma'lumot yoki rasmi yo'q e'lon), Unsplash'dan o'rin bosar rasm olinadi.
 */
export function photo(i, w = 900) {
  if (typeof i === 'string' && i) return i
  if (i == null || Number.isNaN(Number(i))) {
    return `https://images.unsplash.com/photo-${PHOTOS[0]}?auto=format&fit=crop&w=${w}&q=70`
  }
  const id = PHOTOS[Math.abs(Number(i)) % PHOTOS.length]
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`
}

export const DISTRICTS = [
  { id: 'chilonzor', uz: 'Chilonzor', cyrl: 'Чилонзор', ru: 'Чиланзар', en: 'Chilonzor' },
  { id: 'yunusobod', uz: 'Yunusobod', cyrl: 'Юнусобод', ru: 'Юнусабад', en: 'Yunusobod' },
  { id: 'mirzo-ulugbek', uz: "Mirzo Ulug'bek", cyrl: 'Мирзо Улуғбек', ru: 'Мирзо-Улугбек', en: 'Mirzo Ulugbek' },
  { id: 'shayxontohur', uz: 'Shayxontohur', cyrl: 'Шайхонтоҳур', ru: 'Шайхантахур', en: 'Shaykhontohur' },
  { id: 'yakkasaroy', uz: 'Yakkasaroy', cyrl: 'Яккасарой', ru: 'Яккасарай', en: 'Yakkasaroy' },
  { id: 'sergeli', uz: 'Sergeli', cyrl: 'Сергели', ru: 'Сергели', en: 'Sergeli' },
  { id: 'olmazor', uz: 'Olmazor', cyrl: 'Олмазор', ru: 'Алмазар', en: 'Olmazor' },
  { id: 'mirobod', uz: 'Mirobod', cyrl: 'Миробод', ru: 'Мирабад', en: 'Mirobod' },
]

export function districtName(id, locale) {
  const d = DISTRICTS.find((x) => x.id === id)
  if (!d) return id
  if (locale === 'ru') return d.ru
  if (locale === 'en') return d.en
  if (locale === 'uz-cyrl') return d.cyrl
  return d.uz
}

const DESCS = {
  uz: [
    "Metroga 7 daqiqa piyoda. Uy issiq va yorug', kvartira burchak emas, oynalar hovliga qaraydi. Qo'shnilar tinch.",
    'Uy to‘liq ta’mirlangan, mebel va texnika qoladi. Yaqinida maktab, bog‘cha va katta bozor bor.',
    'Yangi binoda, lift ishlaydi, yopiq hovli va parkovka mavjud. Kommunal to‘lovlar arzon.',
    'Keng va yorug‘ kvartira, oshxona alohida. Balkon glazirovka qilingan. Hujjatlar tayyor, tez rasmiylashtiramiz.',
    'Markazda, transport qatnovi qulay. Uy egasi bilan to‘g‘ridan-to‘g‘ri gaplashasiz — vositachi yo‘q.',
  ],
  ru: [
    'До метро 7 минут пешком. Квартира тёплая и светлая, не угловая, окна во двор. Соседи спокойные.',
    'Полностью отремонтирована, мебель и техника остаются. Рядом школа, детсад и большой рынок.',
    'Новостройка, лифт работает, закрытый двор и парковка. Коммунальные платежи невысокие.',
    'Просторная светлая квартира, кухня отдельная. Балкон застеклён. Документы готовы, оформим быстро.',
    'В центре, удобная транспортная развязка. Общение напрямую с собственником — без посредников.',
  ],
  en: [
    'A 7-minute walk to the metro. Warm and bright, not a corner unit, windows face the courtyard. Quiet neighbours.',
    'Fully renovated; furniture and appliances stay. A school, kindergarten and large bazaar are nearby.',
    'New building with a working lift, gated courtyard and parking. Utility bills are low.',
    'Spacious and bright, separate kitchen, glazed balcony. Papers are ready, we can close quickly.',
    'Central location with easy transport links. You deal with the owner directly — no middlemen.',
  ],
}
DESCS['uz-cyrl'] = [
  'Метрога 7 дақиқа пиёда. Уй иссиқ ва ёруғ, квартира бурчак эмас, ойналар ҳовлига қарайди. Қўшнилар тинч.',
  'Уй тўлиқ таъмирланган, мебель ва техника қолади. Яқинида мактаб, боғча ва катта бозор бор.',
  'Янги бинода, лифт ишлайди, ёпиқ ҳовли ва парковка мавжуд. Коммунал тўловлар арзон.',
  'Кенг ва ёруғ квартира, ошхона алоҳида. Балкон глазировка қилинган. Ҳужжатлар тайёр, тез расмийлаштирамиз.',
  'Марказда, транспорт қатнови қулай. Уй эгаси билан тўғридан-тўғри гаплашасиз — воситачи йўқ.',
]

export function description(seed, locale) {
  const arr = DESCS[locale] || DESCS.uz
  return arr[seed % arr.length]
}

const OWNERS = [
  'Dilshod A.', 'Nilufar K.', 'Sardor T.', 'Kamola R.', 'Jasur M.',
  'Zebo N.', 'Otabek S.', 'Malika Y.', 'Bekzod H.', 'Shahnoza I.',
]

const STREETS = {
  chilonzor: ['11-kvartal', '19-kvartal', 'Qatortol', 'Bunyodkor shoh ko‘chasi'],
  yunusobod: ['4-kvartal', '11-kvartal', 'Amir Temur shoh ko‘chasi', 'Bodomzor'],
  'mirzo-ulugbek': ['Buyuk Ipak Yo‘li', 'Mustaqillik', 'Feruza', 'Darxon'],
  shayxontohur: ['Beruniy', 'Chorsu', 'Zarqaynar', 'Navoiy'],
  yakkasaroy: ['Shota Rustaveli', 'Bobur', 'Qushbegi', 'Sadik Azimov'],
  sergeli: ['Yangi Sergeli', 'Quruvchilar', 'Sergeli-7', 'Yangihayot'],
  olmazor: ['Universitet', 'Talabalar shaharchasi', 'Tolariq', 'Qorasaroy'],
  mirobod: ['Oybek', 'Nukus', 'Shevchenko', 'Afrosiyob'],
}

const FEATURES = ['metro', 'furnished', 'parking', 'lift', 'balcony', 'ac', 'school', 'pets']
const REPAIRS = ['euro', 'good', 'average', 'designer', 'none']
const PTYPES = ['apartment', 'apartment', 'apartment', 'newbuild', 'house', 'commercial']

// Deterministik "tasodifiy" generator — har safar bir xil natija
function rng(seed) {
  let s = seed * 9301 + 49297
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function build(i) {
  const r = rng(i + 7)
  const district = DISTRICTS[Math.floor(r() * DISTRICTS.length)].id
  const dealRoll = r()
  const deal = dealRoll < 0.62 ? 'sale' : dealRoll < 0.88 ? 'rent' : 'daily'
  const rooms = 1 + Math.floor(r() * 4)
  const area = Math.round(28 + rooms * 14 + r() * 26)
  const floors = 4 + Math.floor(r() * 12)
  const floor = 1 + Math.floor(r() * floors)
  const year = 1975 + Math.floor(r() * 50)
  const ptype = PTYPES[Math.floor(r() * PTYPES.length)]
  const repair = REPAIRS[Math.floor(r() * REPAIRS.length)]
  const isNew = year >= 2019

  let price
  if (deal === 'sale') price = Math.round((520 + r() * 480) * area * (isNew ? 1.18 : 1)) // USD
  else if (deal === 'rent') price = Math.round((0.05 + r() * 0.07) * area * 10) / 10 // mln so'm / oy
  else price = Math.round(18 + r() * 60)

  const feats = FEATURES.filter(() => r() > 0.55)
  const byAgent = r() > 0.72
  const nPhotos = 4 + Math.floor(r() * 4)
  const promoted = r() > 0.86 // "Top e'lon" / Premium joylashuv (strategik rejadagi monetizatsiya funksiyasi)
  const rating = Math.round((3.6 + r() * 1.4) * 10) / 10 // reyting tizimi — uy egasi/e'lon bahosi
  const ratingCount = 3 + Math.floor(r() * 47)

  return {
    id: 40000 + i * 137,
    deal,
    district,
    address: STREETS[district][Math.floor(r() * 4)],
    price, // sale: USD, rent: mln so'm/oy, daily: USD/kun
    currency: deal === 'rent' ? 'uzs' : 'usd',
    rooms,
    area,
    floor,
    floors,
    year,
    ptype,
    repair,
    docs: r() > 0.15 ? 'ready' : 'process',
    features: feats.length ? feats : ['metro'],
    verified: r() > 0.12,
    byAgent,
    agentId: byAgent ? 1 + Math.floor(r() * 8) : null,
    contractReady: r() > 0.45,
    isNew: r() > 0.7,
    promoted,
    rating,
    ratingCount,
    owner: OWNERS[i % OWNERS.length],
    ownerSince: 2019 + Math.floor(r() * 6),
    ownerAds: 1 + Math.floor(r() * 5),
    views: 40 + Math.floor(r() * 900),
    updatedH: 1 + Math.floor(r() * 70),
    photos: Array.from({ length: nPhotos }, (_, k) => i * 3 + k),
    descSeed: i,
    lat: 41.26 + (r() - 0.5) * 0.16,
    lng: 69.24 + (r() - 0.5) * 0.22,
  }
}

export const LISTINGS = Array.from({ length: 42 }, (_, i) => build(i))

// ⚠️ Bu yerda ilgari `AGENTS` — qo'lda yozilgan 8 ta soxta agent ro'yxati
// turardi. Aynan shu sabab "Agentlar" sahifasida HAQIQIY agentlar hech
// qachon ko'rinmasdi: sahifa bazaga emas, shu massivga qarardi.
//
// Endi agentlar backenddan olinadi:
//     GET /api/agents        — tasdiqlangan agentlar ro'yxati
//     GET /api/agents/<id>   — bitta agent + uning faol e'lonlari
//
// Kod: `src/api/index.js` → `agents`, store: `stores/listings.js` →
// `fetchAgents()` / `ensureAgents()`.
//
// Massivni qaytarib qo'ymang — u soxta ma'lumotni yana yuzaga chiqaradi.

export const NEWBUILDS = [
  { id: 1, name: 'Yangi Hayot Residence', district: 'sergeli', from: 620, handover: '2027 Q2', dev: 'Golden House', inst: '36 oy', ph: 18 },
  { id: 2, name: 'Boulevard Park', district: 'yunusobod', from: 980, handover: '2026 Q4', dev: 'Murad Buildings', inst: '24 oy', ph: 19 },
  { id: 3, name: 'Chilonzor Skyline', district: 'chilonzor', from: 750, handover: '2027 Q1', dev: 'Uzbek Development', inst: '30 oy', ph: 7 },
  { id: 4, name: 'Darxon Garden', district: 'mirzo-ulugbek', from: 890, handover: '2026 Q3', dev: 'Akfa Group', inst: '18 oy', ph: 25 },
  { id: 5, name: 'Oybek Central', district: 'mirobod', from: 1240, handover: '2028 Q1', dev: 'Nrg Development', inst: '36 oy', ph: 10 },
  { id: 6, name: 'Olmazor Campus', district: 'olmazor', from: 690, handover: '2027 Q3', dev: 'Star Build', inst: '24 oy', ph: 23 },
]

export function formatPrice(l, locale) {
  if (l.deal === 'rent') {
    const v = l.price.toLocaleString(locale === 'en' ? 'en-US' : 'ru-RU', { maximumFractionDigits: 1 })
    return { value: v, suffix: locale === 'en' ? 'M UZS' : locale === 'ru' ? 'млн сум' : locale === 'uz-cyrl' ? 'млн сўм' : "mln so'm" }
  }
  return { value: '$' + l.price.toLocaleString('en-US'), suffix: '' }
}
