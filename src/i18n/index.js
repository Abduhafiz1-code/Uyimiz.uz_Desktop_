import { createI18n } from 'vue-i18n'
import uz from './locales/uz.js'
import uzCyrl from './locales/uz-cyrl.js'
import ru from './locales/ru.js'
import en from './locales/en.js'

export const LOCALES = [
  { code: 'uz', label: "O'zbekcha", short: 'UZ', flag: '🇺🇿' },
  { code: 'uz-cyrl', label: 'Ўзбекча', short: 'ЎЗ', flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', short: 'RU', flag: '🇷🇺' },
  { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
]

const STORAGE_KEY = 'uyimiz.locale'

function detect() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && LOCALES.some((l) => l.code === saved)) return saved
  const nav = (navigator.language || 'uz').toLowerCase()
  if (nav.startsWith('ru')) return 'ru'
  if (nav.startsWith('en')) return 'en'
  return 'uz'
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detect(),
  fallbackLocale: 'uz',
  messages: { uz, 'uz-cyrl': uzCyrl, ru, en },
})

export function setLocale(code) {
  if (!LOCALES.some((l) => l.code === code)) return
  i18n.global.locale.value = code
  localStorage.setItem(STORAGE_KEY, code)
  document.documentElement.setAttribute('lang', code === 'uz-cyrl' ? 'uz' : code)
}

document.documentElement.setAttribute('lang', i18n.global.locale.value)
