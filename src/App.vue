<script setup>
import { onMounted, watch } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ToastHost from '@/components/ToastHost.vue'
import LoginModal from '@/components/LoginModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useListingsStore } from '@/stores/listings'

const auth = useAuthStore()
const listings = useListingsStore()

onMounted(async () => {
  // Tumanlar ro'yxati barcha filtrlar uchun kerak.
  listings.fetchDistricts()
  // Saqlangan token hali amal qiladimi — tekshiramiz.
  await auth.refresh()
  if (auth.isAuthed) listings.fetchFavorites()
})

// Kirish yoki chiqishdan keyin shaxsiy ma'lumotlarni yangilaymiz.
watch(
  () => auth.isAuthed,
  (v) => {
    if (v) {
      listings.fetchFavorites()
      listings.fetchMyAds()
    } else {
      listings.favorites.length = 0
    }
  }
)
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <AppFooter />
    <ToastHost />
    <LoginModal />
  </div>
</template>
