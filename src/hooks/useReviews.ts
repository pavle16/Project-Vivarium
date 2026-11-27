import { ref, watch } from 'vue'
import { loadJson, saveJson } from '@/utils/storage'

export interface Review {
    id: string
    plantId: number
    author: string
    rating: number // 1–5
    comment: string
    date: string // YYYY-MM-DD
}

export interface RatingSummary {
    average: number // 0 kad nema recenzija
    count: number
}



const AUTHORS = [
    'Marija P.', 'Nikola J.', 'Jelena S.', 'Stefan M.', 'Ana K.', 'Milan T.',
    'Ivana D.', 'Marko R.', 'Teodora V.', 'Luka B.', 'Sara N.', 'Dušan Đ.',
]

const COMMENTS: Record<number, string[]> = {
    5: ['Stigla je zdrava i brzo raste. Toplo preporučujem!', 'Prelepa biljka, tačno kao u opisu.', 'Savršeno stanje, odlično upakovano.'],
    4: ['Veoma lepa biljka, nekoliko listova se malo oštetilo u transportu.', 'Dobar kvalitet, trebalo joj je nedelju dana da se prilagodi.', 'Odlična kupovina, uputstva za negu su bila korisna.'],
    3: ['Solidno, ali manja nego što se očekivalo.', 'Prosečno. Raste, ali sporo.', 'Pristojna biljka za tu cenu.'],
    2: ['Prvih nekoliko nedelja se mučila, sada se oporavlja.', 'Ne izgleda kao na slici, prilično je mala.'],
    1: ['Stigla je uvela i nije preživela.', 'Stanje pri isporuci je razočaravajuće.'],
}

// generator mock ocena recenzija
function seeded(seed: number) {
    return () => {
        seed |= 0
        seed = (seed + 0x6d2b79f5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const mockCache = new Map<number, Review[]>()

function mockReviews(plantId: number): Review[] {
    const cached = mockCache.get(plantId)
    if (cached) return cached

    const rnd = seeded(plantId * 7919)
    const count = Math.floor(rnd() * 7) // 0–6 
    const bias = rnd() 
    const list: Review[] = []
    for (let i = 0; i < count; i++) {
        const roll = rnd() * 0.6 + bias * 0.4
        const rating = roll > 0.8 ? 5 : roll > 0.55 ? 4 : roll > 0.35 ? 3 : roll > 0.2 ? 2 : 1
        const pool = COMMENTS[rating]!
        const month = 3 + Math.floor(rnd() * 8) // Apr–Nov 2026
        const day = 1 + Math.floor(rnd() * 28)
        list.push({
            id: `mock-${plantId}-${i}`,
            plantId,
            author: AUTHORS[Math.floor(rnd() * AUTHORS.length)]!,
            rating,
            comment: pool[Math.floor(rnd() * pool.length)]!,
            date: `2026-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        })
    }
    mockCache.set(plantId, list)
    return list
}


const userReviews = ref<Review[]>(loadJson('vivarium.reviews', []))
watch(userReviews, v => saveJson('vivarium.reviews', v), { deep: true })

export function useReviews() {
    function getReviews(plantId: number): Review[] {
        return [...userReviews.value.filter(r => r.plantId === plantId), ...mockReviews(plantId)]
    }

    function getRating(plantId: number): RatingSummary {
        const list = getReviews(plantId)
        if (!list.length) return { average: 0, count: 0 }
        return { average: list.reduce((s, r) => s + r.rating, 0) / list.length, count: list.length }
    }

    function addReview(review: Omit<Review, 'id'>) {
        userReviews.value.unshift({ ...review, id: `user-${Date.now()}` })
    }

    return { getReviews, getRating, addReview }
}
