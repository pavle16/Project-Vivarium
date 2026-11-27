<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { usePlants } from '@/hooks/usePlants'
import { useReviews } from '@/hooks/useReviews'
import { useReservation } from '@/hooks/useReservation'
import { SEASONS } from '@/hooks/useSeason'
import { formatDate, formatPrice, plural } from '@/utils/format'
import StarRating from '@/components/StarRating.vue'
import PlantRow from '@/components/PlantRow.vue'

const props = defineProps<{ id: string }>()

const { plants, loading, error, fetchPlants } = usePlants()
const { getReviews, getRating } = useReviews()
const { reserve } = useReservation()

const plant = computed(() => plants.value.find(p => p.id === Number(props.id)))
const rating = computed(() => (plant.value ? getRating(plant.value.id) : { average: 0, count: 0 }))

// ----- Quick facts (each links to the gallery filtered by that value) -----
const facts = computed(() => {
    const p = plant.value
    if (!p) return []
    return [
        { icon: 'fa-solid fa-seedling', label: 'Tip biljke', value: p.plantType, query: { type: p.plantType } },
        { icon: 'fa-solid fa-calendar-days', label: 'Sezona', value: SEASONS[p.seasonId]?.label ?? p.season, query: { season: p.seasonId } },
        { icon: 'fa-solid fa-earth-europe', label: 'Podneblje', value: p.climate, query: { climate: p.climate } },
        { icon: 'fa-solid fa-sun', label: 'Svetlost', value: p.lightRequirement, query: { light: p.lightRequirement } },
        { icon: 'fa-solid fa-droplet', label: 'Zalivanje', value: p.watering, query: null },
        { icon: 'fa-solid fa-house-chimney', label: 'Namena', value: p.intendedUse, query: { use: p.intendedUse } },
        { icon: 'fa-solid fa-user-group', label: 'Ciljna grupa', value: p.targetAudience, query: { audience: p.targetAudience } },
        { icon: 'fa-solid fa-calendar-check', label: 'Datum proizvodnje', value: formatDate(p.productionDate), query: null },
    ]
})

// ----- Reserve -----
const quantity = ref(1)
watch(() => props.id, () => { quantity.value = 1 })

const maxQty = computed(() => plant.value?.stockQuantity ?? 0)

function setQuantity(n: number) {
    quantity.value = Math.min(Math.max(1, Math.floor(n) || 1), Math.max(1, maxQty.value))
}

function onReserve() {
    if (plant.value) reserve(plant.value, quantity.value)
}

// ----- Reviews -----
type ReviewSort = 'newest' | 'highest' | 'lowest'
const reviewSort = ref<ReviewSort>('newest')

const reviews = computed(() => {
    if (!plant.value) return []
    const list = [...getReviews(plant.value.id)]
    if (reviewSort.value === 'highest') return list.sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date))
    if (reviewSort.value === 'lowest') return list.sort((a, b) => a.rating - b.rating || b.date.localeCompare(a.date))
    return list.sort((a, b) => b.date.localeCompare(a.date))
})

// How many reviews gave 5, 4, 3, 2, 1 stars
const distribution = computed(() =>
    [5, 4, 3, 2, 1].map(stars => {
        const count = reviews.value.filter(r => r.rating === stars).length
        return { stars, count, percent: reviews.value.length ? (count / reviews.value.length) * 100 : 0 }
    })
)

// ----- Similar plants -----
const similar = computed(() => {
    const p = plant.value
    if (!p) return []
    return plants.value.filter(x => x.categoryId === p.categoryId && x.id !== p.id).slice(0, 10)
})

function scrollToReviews() {
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
    <div class="mt-4">
        <div v-if="loading" class="d-flex align-items-center gap-2">
            <div class="spinner-border" role="status"></div>
            <span>Učitavanje biljke...</span>
        </div>

        <div v-else-if="error" class="alert alert-danger d-flex justify-content-between align-items-center">
            <span>Biljku nije moguće učitati. Proverite internet vezu i pokušajte ponovo.</span>
            <button class="btn btn-outline-danger btn-sm" type="button" @click="fetchPlants()">Pokušaj ponovo</button>
        </div>

        <div v-else-if="!plant" class="text-center py-5">
            <i class="fa-solid fa-seedling fs-1 text-body-secondary mb-3"></i>
            <p class="fs-5 mb-2">Ova biljka ne postoji ili više nije u ponudi.</p>
            <RouterLink class="btn btn-outline-primary" :to="{ name: 'gallery' }">Nazad na galeriju</RouterLink>
        </div>

        <template v-else>
            <!-- Breadcrumb -->
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><RouterLink :to="{ name: 'home' }">Početna</RouterLink></li>
                    <li class="breadcrumb-item"><RouterLink :to="{ name: 'gallery' }">Galerija</RouterLink></li>
                    <li class="breadcrumb-item">
                        <RouterLink :to="{ name: 'gallery', query: { category: plant.categoryId } }">{{ plant.category }}</RouterLink>
                    </li>
                    <li class="breadcrumb-item active" aria-current="page">{{ plant.name }}</li>
                </ol>
            </nav>

            <!-- Top: image + buy box -->
            <div class="row g-4 mb-5">
                <div class="col-md-5">
                    <div class="plant-image rounded-4 bg-body-tertiary p-4 d-flex align-items-center justify-content-center">
                        <img :src="plant.imageUrl" :alt="plant.imageAlt || plant.name" class="img-fluid" />
                    </div>
                </div>

                <div class="col-md-7">
                    <span class="badge rounded-pill text-bg-light border mb-2">{{ plant.category }}</span>
                    <h1 class="display-6 fw-bold mb-0">{{ plant.name }}</h1>
                    <p class="fst-italic text-body-secondary mb-2">{{ plant.latinName }}</p>

                    <button type="button" class="btn btn-link p-0 text-decoration-none mb-3" @click="scrollToReviews">
                        <StarRating :value="rating.average" :count="rating.count" />
                        <span v-if="rating.count" class="small ms-1">Pogledaj recenzije</span>
                    </button>

                    <p class="fs-5 mb-3">{{ plant.description }}</p>

                    <div class="buy-box border rounded-4 p-3 mb-4">
                        <div class="d-flex flex-wrap align-items-center gap-3 mb-3">
                            <span class="fs-3 fw-bold">{{ formatPrice(plant.price, plant.currency) }}</span>
                            <span v-if="plant.stockQuantity > 0" class="text-success small">
                                <i class="fa-solid fa-circle-check me-1"></i>Na stanju ({{ plant.stockQuantity }})
                            </span>
                            <span v-else class="text-danger small">
                                <i class="fa-solid fa-circle-xmark me-1"></i>Nema na stanju
                            </span>
                        </div>

                        <div class="d-flex flex-wrap align-items-center gap-3">
                            <div class="input-group qty-group" role="group" aria-label="Količina">
                                <button class="btn btn-outline-secondary" type="button" aria-label="Smanji količinu"
                                    :disabled="quantity <= 1" @click="setQuantity(quantity - 1)">
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <input type="number" class="form-control text-center" :value="quantity" min="1"
                                    :max="maxQty" aria-label="Količina" :disabled="maxQty <= 0"
                                    @change="setQuantity(Number(($event.target as HTMLInputElement).value))" />
                                <button class="btn btn-outline-secondary" type="button" aria-label="Povećaj količinu"
                                    :disabled="quantity >= maxQty" @click="setQuantity(quantity + 1)">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>

                            <button class="btn btn-primary btn-lg flex-grow-1" type="button" :disabled="maxQty <= 0"
                                @click="onReserve">
                                <i class="fa-solid fa-basket-shopping me-2"></i>Dodaj u korpu
                                <span v-if="quantity > 1" class="fw-normal">· {{ formatPrice(plant.price * quantity, plant.currency) }}</span>
                            </button>
                        </div>
                        <p class="small text-body-secondary mb-0 mt-2">
                            <i class="fa-solid fa-circle-info me-1"></i>
                            Biljka se dodaje u korpu, a rezervaciju potvrđujete u korpi. Potvrđenu rezervaciju možete menjati dok biljka ne pristigne.
                        </p>
                    </div>

                    <!-- Quick facts -->
                    <div class="row row-cols-2 row-cols-lg-4 g-2">
                        <div v-for="f in facts" :key="f.label" class="col">
                            <div class="fact h-100 rounded-3 bg-body-tertiary p-2">
                                <div class="small text-body-secondary"><i :class="f.icon" class="text-primary me-1"></i>{{ f.label }}</div>
                                <RouterLink v-if="f.query" class="fw-semibold small" :to="{ name: 'gallery', query: f.query }"
                                    :title="`Prikaži sve biljke: ${f.value}`">
                                    {{ f.value }}
                                </RouterLink>
                                <span v-else class="fw-semibold small">{{ f.value }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Planting & care -->
            <section class="row g-3 mb-5" aria-label="Sadnja i nega">
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-body">
                            <h2 class="h5"><i class="fa-solid fa-trowel text-primary me-2"></i>Sadnja</h2>
                            <p class="card-text mb-0">{{ plant.plantingInstructions }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-body">
                            <h2 class="h5"><i class="fa-solid fa-hand-holding-droplet text-primary me-2"></i>Nega</h2>
                            <p class="card-text">{{ plant.careInstructions }}</p>
                            <div class="d-flex flex-wrap gap-2">
                                <span class="badge rounded-pill text-bg-light border">
                                    <i class="fa-solid fa-sun me-1"></i>{{ plant.lightRequirement }}
                                </span>
                                <span class="badge rounded-pill text-bg-light border">
                                    <i class="fa-solid fa-droplet me-1"></i>Zalivanje: {{ plant.watering }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Reviews -->
            <section id="reviews" class="mb-5">
                <h2 class="h4 mb-3"><i class="fa-solid fa-star text-primary me-2"></i>Recenzije kupaca</h2>

                <div v-if="rating.count === 0" class="text-body-secondary border rounded-4 p-4 text-center">
                    <p class="mb-1">Još nema recenzija.</p>
                    <p class="small mb-0">Kupci mogu oceniti ovu biljku kada njihova rezervacija pristigne.</p>
                </div>

                <div v-else class="row g-4">
                    <!-- Summary -->
                    <div class="col-md-4">
                        <div class="border rounded-4 p-3">
                            <div class="d-flex align-items-baseline gap-2">
                                <span class="display-5 fw-bold">{{ rating.average.toFixed(1) }}</span>
                                <span class="text-body-secondary">/ 5</span>
                            </div>
                            <StarRating :value="rating.average" />
                            <p class="small text-body-secondary mt-1">{{ rating.count }} {{ plural(rating.count, 'recenzija', 'recenzije', 'recenzija') }}</p>
                            <div v-for="d in distribution" :key="d.stars" class="d-flex align-items-center gap-2 small mb-1">
                                <span class="text-nowrap" style="width: 2.5rem">{{ d.stars }} <i class="fa-solid fa-star star-gold"></i></span>
                                <div class="progress flex-grow-1" style="height: .5rem" role="progressbar"
                                    :aria-label="`Ocena ${d.stars}`" :aria-valuenow="d.count" aria-valuemin="0"
                                    :aria-valuemax="rating.count">
                                    <div class="progress-bar bar-gold" :style="{ width: d.percent + '%' }"></div>
                                </div>
                                <span class="text-body-secondary" style="width: 1.5rem">{{ d.count }}</span>
                            </div>
                            <p class="small text-body-secondary mb-0 mt-3">
                                <i class="fa-solid fa-circle-info me-1"></i>
                                Ocenu mogu ostaviti samo kupci kojima je rezervacija ove biljke pristigla.
                            </p>
                        </div>
                    </div>

                    <!-- List -->
                    <div class="col-md-8">
                        <div class="d-flex justify-content-end align-items-center gap-2 mb-2">
                            <label for="review-sort" class="small text-body-secondary">Sortiraj</label>
                            <select id="review-sort" v-model="reviewSort" class="form-select form-select-sm w-auto">
                                <option value="newest">Najnovije prvo</option>
                                <option value="highest">Najbolje ocenjene</option>
                                <option value="lowest">Najlošije ocenjene</option>
                            </select>
                        </div>
                        <ul class="list-unstyled mb-0">
                            <li v-for="r in reviews" :key="r.id" class="border-bottom py-3">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <div class="d-flex align-items-center gap-2">
                                        <span class="avatar rounded-circle bg-primary-subtle text-primary-emphasis fw-semibold">
                                            {{ r.author.charAt(0) }}
                                        </span>
                                        <span class="fw-semibold">{{ r.author }}</span>
                                        <span class="badge text-bg-light border small">
                                            <i class="fa-solid fa-circle-check text-success me-1"></i>Potvrđena kupovina
                                        </span>
                                    </div>
                                    <small class="text-body-secondary">{{ formatDate(r.date) }}</small>
                                </div>
                                <StarRating :value="r.rating" />
                                <p class="mb-0 mt-1">{{ r.comment }}</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- Similar plants -->
            <section v-if="similar.length" class="mb-5">
                <div class="d-flex justify-content-between align-items-end mb-3">
                    <h2 class="h4 mb-0">Još iz kategorije {{ plant.category }}</h2>
                    <RouterLink :to="{ name: 'gallery', query: { category: plant.categoryId } }">Prikaži sve</RouterLink>
                </div>
                <PlantRow :plants="similar" />
            </section>
        </template>
    </div>
</template>

<style scoped>
.plant-image {
    aspect-ratio: 1 / 1;
}

.plant-image img {
    max-height: 100%;
}

.qty-group {
    width: 9rem;
}

.qty-group input::-webkit-outer-spin-button,
.qty-group input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.qty-group input {
    -moz-appearance: textfield;
    appearance: textfield;
}

.avatar {
    width: 2rem;
    height: 2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.star-gold {
    color: #e0a526;
}

.bar-gold {
    background-color: #e0a526;
}
</style>
