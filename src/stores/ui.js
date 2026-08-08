import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { i18n, setLocale as applyLocale, LOCALES } from '@/i18n'

export const THEMES = [
  { id: 'uyimiz', dot: '#0f766e', icon: 'sun' },
  { id: 'uyimiz-dark', dot: '#2dd4bf', icon: 'moon' },
  { id: 'uyimiz-emerald', dot: '#059669', icon: 'leaf' },
  { id: 'uyimiz-sand', dot: '#b45309', icon: 'sparkles' },
]

const THEME_KEY = 'uyimiz.theme'

export const useUiStore = defineStore('ui', () => {
  const theme = ref(localStorage.getItem(THEME_KEY) || 'uyimiz')
  const toasts = ref([])
  const mobileMenu = ref(false)
  const loginOpen = ref(false)
  let toastId = 0

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t)
  }
  applyTheme(theme.value)

  function setTheme(t) {
    if (!THEMES.some((x) => x.id === t)) return
    theme.value = t
    localStorage.setItem(THEME_KEY, t)
    applyTheme(t)
  }

  function cycleTheme() {
    const i = THEMES.findIndex((t) => t.id === theme.value)
    setTheme(THEMES[(i + 1) % THEMES.length].id)
  }

  const locale = computed(() => i18n.global.locale.value)
  function setLocale(code) {
    applyLocale(code)
  }

  function toast(message, type = 'success') {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), 3600)
    return id
  }
  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    theme, themes: THEMES, setTheme, cycleTheme,
    locale, locales: LOCALES, setLocale,
    toasts, toast, dismiss,
    mobileMenu, loginOpen,
  }
})
