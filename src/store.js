import { ref } from "vue";

const THEME_KEY = "uyimiz-theme";
export const themes = ["teal", "midnight", "sand"];
export const theme = ref(localStorage.getItem(THEME_KEY) || "teal");

export function setTheme(name) {
  theme.value = name;
  localStorage.setItem(THEME_KEY, name);
  document.documentElement.setAttribute("data-theme", name);
}

// very small client-side "router" — avoids adding vue-router as a dependency
// view: 'home' | 'search' | 'listing'
export const view = ref("home");
export const activeListingId = ref(null);
export const searchDeal = ref("buy"); // 'buy' | 'rent' | 'daily'
export const searchQuery = ref("");

export function goHome() {
  view.value = "home";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
export function goSearch(deal = "buy", query = "") {
  searchDeal.value = deal;
  searchQuery.value = query;
  view.value = "search";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
export function goListing(id) {
  activeListingId.value = id;
  view.value = "listing";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
