<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePlants, type Plant } from '@/hooks/usePlants'
import { currentSeason, SEASONS, SEASON_YEAR_ROUND } from '@/hooks/useSeason'
import { useAuth } from '@/hooks/useAuth'
import { plural } from '@/utils/format'
import { categoryIcon } from '@/utils/categories'
import PlantRow from '@/components/PlantRow.vue'

const { plants, loading, error, fetchPlants } = usePlants()

const season = currentSeason()
const yearRound = SEASONS[SEASON_YEAR_ROUND]!

const categories = computed(() => {
    const map = new Map<number, { id: number; name: string; count: number }>()
    for (const p of plants.value) {
        const c = map.get(p.categoryId)
        if (c) c.count++
        else map.set(p.categoryId, { id: p.categoryId, name: p.category, count: 1 })
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
})

// Plants in stock come first
const byAvailability = (a: Plant, b: Plant) => Number(b.stockQuantity > 0) - Number(a.stockQuantity > 0)

const inSeason = computed(() =>
    plants.value.filter(p => p.seasonId === season.id).sort(byAvailability)
)

const yearRoundCount = computed(() =>
    plants.value.filter(p => p.seasonId === SEASON_YEAR_ROUND).length
)

// Logged-in users get picks from their favourite plant types (set in the profile)
const { currentUser } = useAuth()
const favoriteCategoryIds = computed(() => currentUser.value?.favoriteCategories ?? [])

const recommended = computed(() => {
    const available = plants.value.filter(p => p.stockQuantity > 0)
    const favs = favoriteCategoryIds.value
    const picks = favs.length
        ? available.filter(p => favs.includes(p.categoryId))
        : available.filter(p => p.targetAudience === 'Početnici')
    return picks.slice(0, 10)
})

const recommendedTitle = computed(() =>
    favoriteCategoryIds.value.length ? 'Preporučeno za vas' : 'Lake za uzgoj: idealne za početnike'
)
</script>

<template>
    <div class="mt-4">
        <!-- Season banner -->
        <section class="season-hero rounded-4 p-4 p-md-5 mb-4 text-white">
            <div class="d-flex align-items-center gap-2 mb-2 opacity-75">
                <i :class="season.icon"></i>
                <span class="text-uppercase small fw-semibold">Trenutna sezona</span>
            </div>
            <h1 class="display-5 fw-bold mb-2">{{ season.label }}</h1>
            <p class="fs-5 mb-4 col-md-8">{{ season.tagline }}</p>
            <div class="d-flex flex-wrap gap-2">
                <RouterLink class="btn btn-light" :to="{ name: 'gallery', query: { season: season.id } }">
                    Pogledaj {{ season.plantsLabel }}
                    <i class="fa-solid fa-arrow-right ms-1"></i>
                </RouterLink>
                <RouterLink class="btn btn-outline-light" :to="{ name: 'gallery' }">Sve biljke</RouterLink>
            </div>
        </section>

        <!-- Category shortcuts -->
        <section class="mb-4" aria-label="Pregled po kategorijama">
            <div class="category-scroller d-flex gap-2 overflow-auto pb-2">
                <RouterLink v-for="c in categories" :key="c.id"
                    class="btn btn-outline-primary rounded-pill text-nowrap d-flex align-items-center gap-2"
                    :to="{ name: 'gallery', query: { category: c.id } }">
                    <i :class="categoryIcon(c.id)"></i>
                    {{ c.name }}
                    <span class="badge rounded-pill text-bg-secondary">{{ c.count }}</span>
                </RouterLink>
            </div>
        </section>

        <div v-if="loading" class="d-flex align-items-center gap-2 py-4">
            <div class="spinner-border" role="status"></div>
            <span>Učitavanje biljaka...</span>
        </div>

        <div v-else-if="error" class="alert alert-danger d-flex justify-content-between align-items-center">
            <span>Biljke nije moguće učitati. Proverite internet vezu i pokušajte ponovo.</span>
            <button class="btn btn-outline-danger btn-sm" type="button" @click="fetchPlants()">Pokušaj ponovo</button>
        </div>

        <template v-else>
            <!-- In season now -->
            <section class="mb-5">
                <div class="d-flex justify-content-between align-items-end mb-3">
                    <div>
                        <h2 class="h4 mb-0"><i :class="season.icon" class="text-primary me-2"></i>Aktuelno ove sezone</h2>
                        <small class="text-body-secondary">{{ inSeason.length }} {{ plural(inSeason.length, 'biljka', 'biljke', 'biljaka') }} za ovu sezonu</small>
                    </div>
                    <RouterLink :to="{ name: 'gallery', query: { season: season.id } }">Prikaži sve</RouterLink>
                </div>
                <PlantRow v-if="inSeason.length" :plants="inSeason" />
                <p v-else class="text-body-secondary">Trenutno nema sezonskih biljaka. Pogledajte one koje rastu tokom cele godine.</p>
                <p class="small text-body-secondary mt-1 mb-0">
                    <i :class="yearRound.icon" class="me-1"></i>
                    Uz to, {{ yearRoundCount }} {{ plural(yearRoundCount, 'biljka je dostupna', 'biljke su dostupne', 'biljaka je dostupno') }} tokom cele godine.
                    <RouterLink :to="{ name: 'gallery', query: { season: SEASON_YEAR_ROUND } }">Prikaži ih</RouterLink>
                </p>
            </section>

            <!-- Recommended -->
            <section class="mb-5" v-if="recommended.length">
                <div class="d-flex justify-content-between align-items-end mb-3">
                    <div>
                        <h2 class="h4 mb-0"><i class="fa-solid fa-star text-primary me-2"></i>{{ recommendedTitle }}</h2>
                        <small v-if="favoriteCategoryIds.length" class="text-body-secondary">
                            Na osnovu omiljenih vrsta iz vašeg
                            <RouterLink :to="{ name: 'profile' }">profila</RouterLink>
                        </small>
                    </div>
                    <RouterLink :to="{ name: 'gallery' }">Pogledaj sve</RouterLink>
                </div>
                <PlantRow :plants="recommended" />
            </section>
        </template>
    </div>
</template>

<style scoped>
.season-hero {
    background: linear-gradient(135deg, #3a5a40 0%, #588157 55%, #a3b18a 100%);
}

[data-bs-theme="dark"] .season-hero {
    background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 55%, #40916c 100%);
}

.category-scroller {
    scrollbar-width: thin;
}
</style>
