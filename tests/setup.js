// Testlar Node muhitida ishlaydi (brauzer emas), chunki happy-dom'ning
// fetch'i cross-origin so'rovlarda Authorization sarlavhasini yubormaydi
// va natijada hamma narsa 401 bo'ladi — bu mahsulot xatosi emas, harness
// cheklovi. Node'ning native fetch'i CORS'ni tekshirmaydi.
//
// Backend CORS'i alohida tekshirilgan: preflight `authorization`ga ruxsat
// beradi (DEPLOY hujjatiga qarang).

class MemoryStorage {
  #map = new Map()
  getItem(k) {
    return this.#map.has(k) ? this.#map.get(k) : null
  }
  setItem(k, v) {
    this.#map.set(k, String(v))
  }
  removeItem(k) {
    this.#map.delete(k)
  }
  clear() {
    this.#map.clear()
  }
  key(i) {
    return [...this.#map.keys()][i] ?? null
  }
  get length() {
    return this.#map.size
  }
}

globalThis.localStorage = new MemoryStorage()
globalThis.window = globalThis.window || {
  location: { href: '', pathname: '/', hash: '' },
}
