import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/search', name: 'search', component: () => import('@/views/SearchView.vue') },
  { path: '/listing/:id', name: 'listing', component: () => import('@/views/ListingDetailView.vue') },
  { path: '/contract/:id', name: 'contract', component: () => import('@/views/ContractView.vue') },
  { path: '/agents', name: 'agents', component: () => import('@/views/AgentsView.vue') },
  { path: '/new-buildings', name: 'newbuild', component: () => import('@/views/NewBuildingsView.vue') },
  { path: '/post', name: 'post', component: () => import('@/views/PostAdView.vue') },
  { path: '/favorites', name: 'favorites', component: () => import('@/views/FavoritesView.vue') },
  { path: '/profile', name: 'profile', component: () => import('@/views/ProfileView.vue') },
  { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('@/views/NotFoundView.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 90 }
    return { top: 0 }
  },
})
