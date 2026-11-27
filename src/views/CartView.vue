<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { usePlants, type Plant } from '@/hooks/usePlants'
import { useAuth } from '@/hooks/useAuth'
import { useCart, STATUS_BADGE, type CartItem, type CartStatus } from '@/hooks/useCart'
import { useReviews } from '@/hooks/useReviews'
import { useToast } from '@/hooks/useToast'
import { formatDate, formatPrice, plural } from '@/utils/format'
import StarRating from '@/components/StarRating.vue'

const { plants, loading, error, fetchPlants } = usePlants()
const { currentUser } = useAuth()
const { items, confirmAll, setQuantity, cancel, remove, rate } = useCart()
const { addReview } = useReviews()
const { show } = useToast()

// Each cart item joined with its plant's data
const rows = computed(() =>
    items.value
        .map(item => ({ item, plant: plants.value.find(p => p.id === item.plantId) }))
        .filter((r): r is { item: CartItem; plant: Plant } => !!r.plant)
)

const SECTIONS: { status: CartStatus; title: string; hint: string }[] = [
    { status: 'nepotvrđeno', title: 'U korpi', hint: 'Još nije rezervisano. Proverite količine i kliknite „Potvrdi rezervaciju“.' },
    { status: 'rezervisano', title: 'Rezervisano', hint: 'Čeka isporuku. Možete promeniti količinu ili otkazati rezervaciju.' },
    { status: 'pristiglo', title: 'Pristiglo', hint: 'Biljka je stigla. Možete je oceniti i ukloniti iz korpe.' },
    { status: 'otkazano', title: 'Otkazano', hint: 'Otkazane rezervacije se ne računaju u ukupnu cenu.' },
]

const sections = computed(() =>
    SECTIONS.map(s => {
        const list = rows.value.filter(r => r.item.status === s.status)
        return { ...s, rows: list, sum: list.reduce((sum, r) => sum + r.plant.price * r.item.quantity, 0) }
    })
)

// Total = everything that isn't cancelled
const total = computed(() => sections.value.filter(s => s.status !== 'otkazano').reduce((sum, s) => sum + s.sum, 0))

// Items waiting for confirmation (first section)
const pending = computed(() => sections.value[0]!)

// ----- Actions -----
function onConfirm() {
    const n = confirmAll()
    show({
        title: 'Rezervacija je potvrđena',
        message: `${n} ${plural(n, 'biljka je rezervisana', 'biljke su rezervisane', 'biljaka je rezervisano')}. Status možete pratiti u korpi.`,
    })
}

function changeQuantity(item: CartItem, plant: Plant, quantity: number) {
    setQuantity(item.id, Math.min(Math.max(1, quantity), plant.stockQuantity))
}

function onCancel(item: CartItem, plant: Plant) {
    if (!window.confirm(`Otkazati rezervaciju za ${plant.name}?`)) return
    cancel(item.id)
    show({ title: 'Rezervacija je otkazana', message: plant.name, variant: 'info' })
}

function onRemove(item: CartItem, plant: Plant) {
    if (!window.confirm(`Ukloniti ${plant.name} iz korpe?`)) return
    remove(item.id)
    show({ title: 'Biljka je uklonjena iz korpe', message: plant.name, variant: 'info' })
}

// Rating form state (stars, comment, error) per cart item
type Draft = { rating: number; comment: string; error: string }
const drafts = reactive<Record<number, Draft>>({})
watch(items, list => {
    for (const i of list) drafts[i.id] ??= { rating: 0, comment: '', error: '' }
}, { immediate: true, deep: true })

function draftOf(id: number): Draft {
    return drafts[id]!
}

function onRate(item: CartItem, plant: Plant) {
    const d = draftOf(item.id)
    if (!d.rating) {
        d.error = 'Izaberite ocenu od 1 do 5 zvezdica.'
        return
    }
    const u = currentUser.value!
    addReview({
        plantId: plant.id,
        author: `${u.firstName} ${u.lastName.charAt(0)}.`,
        rating: d.rating,
        comment: d.comment.trim(),
        date: new Date().toISOString().slice(0, 10),
    })
    rate(item.id, d.rating)
    show({ title: 'Hvala na oceni!', message: `Vaša ocena je dodata u recenzije za ${plant.name}.` })
}
</script>

<template>
    <div class="my-4">
        <h1 class="h3 mb-4">Korpa rezervacija</h1>

        <div v-if="loading" class="d-flex align-items-center gap-2">
            <div class="spinner-border" role="status"></div>
            <span>Učitavanje korpe...</span>
        </div>

        <div v-else-if="error" class="alert alert-danger d-flex justify-content-between align-items-center">
            <span>Korpu nije moguće učitati. Proverite internet vezu i pokušajte ponovo.</span>
            <button class="btn btn-outline-danger btn-sm" type="button" @click="fetchPlants()">Pokušaj ponovo</button>
        </div>

        <div v-else-if="rows.length === 0" class="text-center py-5">
            <i class="fa-solid fa-basket-shopping fs-1 text-body-secondary mb-3"></i>
            <p class="fs-5 mb-2">Vaša korpa je prazna.</p>
            <p class="text-body-secondary">Pronađite biljku u galeriji i kliknite „Dodaj u korpu“.</p>
            <RouterLink class="btn btn-primary" :to="{ name: 'gallery' }">Pogledaj ponudu</RouterLink>
        </div>

        <div v-else class="row g-4">
            <!-- Items grouped by status -->
            <div class="col-lg-8">
                <section v-for="s in sections" v-show="s.rows.length" :key="s.status" class="mb-4">
                    <div class="d-flex align-items-center gap-2 mb-1">
                        <span class="badge" :class="STATUS_BADGE[s.status]">{{ s.status }}</span>
                        <h2 class="h5 mb-0">{{ s.title }} ({{ s.rows.length }})</h2>
                    </div>
                    <p class="small text-body-secondary mb-2">{{ s.hint }}</p>

                    <div v-for="{ item, plant } in s.rows" :key="item.id" class="card mb-3"
                        :class="{ 'opacity-75': item.status === 'otkazano' }">
                        <div class="card-body">
                            <div class="d-flex gap-3">
                                <RouterLink :to="{ name: 'plant', params: { id: plant.id } }" class="flex-shrink-0">
                                    <img :src="plant.imageUrl" :alt="plant.imageAlt || plant.name"
                                        class="thumb rounded-3 bg-body-tertiary p-1" />
                                </RouterLink>

                                <div class="flex-grow-1 min-w-0">
                                    <div class="d-flex flex-wrap justify-content-between gap-2">
                                        <div>
                                            <RouterLink :to="{ name: 'plant', params: { id: plant.id } }"
                                                class="h6 mb-0 text-reset text-decoration-none fw-semibold">
                                                {{ plant.name }}
                                            </RouterLink>
                                            <div class="small fst-italic text-body-secondary">{{ plant.latinName }}</div>
                                        </div>
                                        <div class="text-end">
                                            <div class="fw-bold"
                                                :class="{ 'text-decoration-line-through': item.status === 'otkazano' }">
                                                {{ formatPrice(plant.price * item.quantity, plant.currency) }}
                                            </div>
                                            <div class="small text-body-secondary">
                                                {{ item.quantity }} × {{ formatPrice(plant.price, plant.currency) }}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Plant info -->
                                    <ul class="list-inline small text-body-secondary mt-2 mb-1">
                                        <li class="list-inline-item"><i class="fa-solid fa-layer-group me-1"></i>{{ plant.category }}</li>
                                        <li class="list-inline-item"><i class="fa-solid fa-seedling me-1"></i>{{ plant.plantType }}</li>
                                        <li class="list-inline-item"><i class="fa-solid fa-user-group me-1"></i>{{ plant.targetAudience }}</li>
                                        <li class="list-inline-item"><i class="fa-solid fa-calendar-check me-1"></i>Proizvedeno {{ formatDate(plant.productionDate) }}</li>
                                        <li class="list-inline-item"><i class="fa-solid fa-clock me-1"></i>{{ item.status === 'nepotvrđeno' ? 'Dodato' : 'Rezervisano' }} {{ formatDate(item.reservedAt) }}</li>
                                    </ul>
                                    <details class="small mb-2">
                                        <summary class="text-primary">Opis, sadnja i nega</summary>
                                        <p class="mt-2 mb-1">{{ plant.description }}</p>
                                        <p class="mb-1"><strong>Sadnja:</strong> {{ plant.plantingInstructions }}</p>
                                        <p class="mb-0"><strong>Nega:</strong> {{ plant.careInstructions }}</p>
                                    </details>

                                    <!-- Nepotvrđeno / rezervisano: change quantity; remove (unconfirmed) or cancel (reserved) -->
                                    <div v-if="item.status === 'nepotvrđeno' || item.status === 'rezervisano'"
                                        class="d-flex flex-wrap align-items-center gap-2">
                                        <span class="small">Količina:</span>
                                        <div class="btn-group btn-group-sm" role="group" aria-label="Količina">
                                            <button type="button" class="btn btn-outline-secondary" aria-label="Smanji količinu"
                                                :disabled="item.quantity <= 1"
                                                @click="changeQuantity(item, plant, item.quantity - 1)">
                                                <i class="fa-solid fa-minus"></i>
                                            </button>
                                            <span class="btn btn-outline-secondary disabled qty">{{ item.quantity }}</span>
                                            <button type="button" class="btn btn-outline-secondary" aria-label="Povećaj količinu"
                                                :disabled="item.quantity >= plant.stockQuantity"
                                                @click="changeQuantity(item, plant, item.quantity + 1)">
                                                <i class="fa-solid fa-plus"></i>
                                            </button>
                                        </div>
                                        <button v-if="item.status === 'nepotvrđeno'" type="button"
                                            class="btn btn-sm btn-outline-danger ms-auto" @click="onRemove(item, plant)">
                                            <i class="fa-solid fa-trash me-1"></i>Ukloni iz korpe
                                        </button>
                                        <button v-else type="button" class="btn btn-sm btn-outline-danger ms-auto"
                                            @click="onCancel(item, plant)">
                                            Otkaži rezervaciju
                                        </button>
                                    </div>

                                    <!-- Pristiglo: rate, remove -->
                                    <div v-else-if="item.status === 'pristiglo'">
                                        <div v-if="item.rating" class="d-flex align-items-center gap-2 small">
                                            <span>Vaša ocena:</span>
                                            <StarRating :value="item.rating" />
                                        </div>
                                        <div v-else class="rate-box border rounded-3 p-2">
                                            <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                                                <span class="small fw-semibold">Ocenite biljku:</span>
                                                <div role="radiogroup" aria-label="Ocena">
                                                    <button v-for="n in 5" :key="n" type="button"
                                                        class="btn btn-link p-0 star-btn" role="radio"
                                                        :aria-checked="draftOf(item.id).rating === n"
                                                        :aria-label="`${n} od 5`"
                                                        @click="draftOf(item.id).rating = n; draftOf(item.id).error = ''">
                                                        <i :class="n <= draftOf(item.id).rating ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <textarea v-model="draftOf(item.id).comment" class="form-control form-control-sm mb-2"
                                                rows="2" placeholder="Komentar (nije obavezan)" aria-label="Komentar"></textarea>
                                            <div v-if="draftOf(item.id).error" class="text-danger small mb-2">
                                                {{ draftOf(item.id).error }}
                                            </div>
                                            <button type="button" class="btn btn-sm btn-primary" @click="onRate(item, plant)">
                                                Pošalji ocenu
                                            </button>
                                        </div>
                                        <div class="text-end mt-2">
                                            <button type="button" class="btn btn-sm btn-outline-danger" @click="onRemove(item, plant)">
                                                <i class="fa-solid fa-trash me-1"></i>Ukloni iz korpe
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Summary -->
            <!-- order-first: on phones the summary (and confirm button) comes before the list -->
            <aside class="col-lg-4 order-first order-lg-last">
                <div class="card shadow-sm summary">
                    <div class="card-body">
                        <h2 class="h5">Pregled</h2>
                        <div v-for="s in sections.filter(x => x.status !== 'otkazano')" :key="s.status"
                            class="d-flex justify-content-between small mb-1">
                            <span>{{ s.title }} ({{ s.rows.length }} {{ plural(s.rows.length, 'stavka', 'stavke', 'stavki') }})</span>
                            <span>{{ formatPrice(s.sum) }}</span>
                        </div>
                        <hr />
                        <div class="d-flex justify-content-between align-items-baseline">
                            <span class="fw-semibold">Ukupno</span>
                            <span class="fs-4 fw-bold">{{ formatPrice(total) }}</span>
                        </div>
                        <p class="small text-body-secondary mt-2 mb-3">Otkazane rezervacije se ne računaju u ukupnu cenu.</p>

                        <!-- Confirm: every unconfirmed item becomes 'rezervisano' -->
                        <div v-if="pending.rows.length" class="border-top pt-3 mb-3">
                            <p class="small mb-2">
                                U korpi {{ plural(pending.rows.length, 'je', 'su', 'je') }}
                                {{ pending.rows.length }} {{ plural(pending.rows.length, 'nepotvrđena stavka', 'nepotvrđene stavke', 'nepotvrđenih stavki') }}
                                ({{ formatPrice(pending.sum) }}).
                            </p>
                            <button type="button" class="btn btn-primary w-100" @click="onConfirm">
                                <i class="fa-solid fa-check me-2"></i>Potvrdi rezervaciju
                            </button>
                        </div>
                        <RouterLink class="btn btn-outline-primary w-100" :to="{ name: 'gallery' }">Nastavi sa izborom</RouterLink>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</template>

<style scoped>
.thumb {
    width: 88px;
    height: 88px;
    object-fit: contain;
}

.min-w-0 {
    min-width: 0;
}

.qty {
    min-width: 2.5rem;
    opacity: 1;
}

.star-btn {
    color: #e0a526;
    font-size: 1.25rem;
    line-height: 1;
}

.summary {
    position: sticky;
    top: 1rem;
}
</style>
