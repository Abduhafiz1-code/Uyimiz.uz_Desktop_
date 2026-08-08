# Uyimiz.uz — Desktop web platforma (prototip)

O‘zbekistonning maklersiz ko‘chmas mulk platformasi. Vue 3 + Vite + Tailwind CSS + daisyUI +
Vue Router + Pinia + vue-i18n asosida qurilgan, to‘liq ishlaydigan interfeys prototipi.

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ papkasiga yig'adi
npm run preview  # yig'ilgan versiyani ko'rish
```

## Nima bor

**4 ta til** — O‘zbekcha (lotin), Ўзбекча (kirill), Русский, English. Header'dagi 🌐 tugmasidan
almashtiriladi, tanlov `localStorage` da saqlanadi.

**4 ta theme** — Yorug‘, Qorong‘i, Zumrad, Qumrang. daisyUI custom theme sifatida
`tailwind.config.js` da aniqlangan, header'dagi theme tugmasidan yoki Kabinet → Sozlamalar'dan
almashtiriladi.

**Sahifalar**

| Yo‘l | Sahifa |
| --- | --- |
| `/` | Bosh sahifa — hero, qidiruv, statistika, ikki model, "qanday ishlaydi", ishonch bloki, agentlar, CTA |
| `/search` | Qidiruv — filtrlar, saralash, sahifalash, xarita paneli |
| `/listing/:id` | E’lon sahifasi — galereya, xususiyatlar, egasi, chat, shartnoma |
| `/agents` | Uyimiz Agentlari — filtr, saralash, bog‘lanish |
| `/new-buildings` | Yangi qurilishlar |
| `/post` | E’lon joylash — 4 qadamli forma, validatsiya, preview |
| `/favorites` | Sevimlilar |
| `/profile` | Kabinet — e’lonlarim, sevimlilar, sozlamalar |
| `/about` | Loyiha haqida — missiya, muammo, yo‘l xaritasi, monetizatsiya |

**Ishlaydigan funksiyalar** — qidiruv va barcha filtrlar, saralash, sahifalash, sevimlilarga
qo‘shish (localStorage), telefon orqali kirish (demo SMS kod — istalgan 4 raqam), myID
tasdiqlash, e’lon joylash va uni kabinetda ko‘rish/o‘chirish, egasi bilan chat, onlayn
shartnoma tayyorlash, til va theme almashtirish, ulashish, shikoyat, toast bildirishnomalar.

## Tuzilma

```
src/
├─ components/   AppHeader, AppFooter, ListingCard, SearchBar, modallar, Icon, SmartImage
├─ views/        sahifalar
├─ stores/       Pinia: ui (theme/til/toast), auth, listings (filtr/sevimli/e'lonlar)
├─ i18n/         4 ta til fayli
├─ data/         demo e'lonlar, agentlar, yangi qurilishlar
└─ router/       Vue Router
```

Ma’lumotlar demo — `src/data/listings.js` da deterministik generator bilan yaratiladi.
Real loyihada bu qatlam API bilan almashtiriladi (`stores/listings.js` dagi `base` ref).
Rasmlar Unsplash'dan yuklanadi, yuklanmasa `picsum.photos` ga tushadi.
