import { computed, ref, watch } from 'vue'
import { loadJson, saveJson } from '@/utils/storage'
import { useAuth } from './useAuth'

// korpa, jedna po useru i cuva se u localu

// 'nepotvrđeno' dodato u korpu ali jos nije potvrdjeno
// 'rezervisano' potvrdjen proizvod i ceka isporuku
// 'pristiglo' proizvod je stigao
// 'otkazano' proizvod je otkazan u medjuvremenu
export type CartStatus = 'nepotvrđeno' | 'rezervisano' | 'pristiglo' | 'otkazano'

export interface CartItem {
    id: number
    plantId: number
    quantity: number
    status: CartStatus
    reservedAt: string // YYYY-MM-DD
    rating?: number // 1–5
}

// obavestenja kod korpe na nav baru
export const STATUS_BADGE: Record<CartStatus, string> = {
    'nepotvrđeno': 'text-bg-info',
    rezervisano: 'text-bg-warning',
    pristiglo: 'text-bg-success',
    otkazano: 'text-bg-secondary',
}

// testiranje korpe
function demoItems(): CartItem[] {
    return [
        { id: 1, plantId: 1, quantity: 1, status: 'rezervisano', reservedAt: '2026-11-20' },  // Monstera deliciosa
        { id: 2, plantId: 31, quantity: 2, status: 'rezervisano', reservedAt: '2026-11-22' }, // Aloe vera
        { id: 3, plantId: 29, quantity: 1, status: 'pristiglo', reservedAt: '2026-10-28' },   // Orhideja falenopsis
        { id: 4, plantId: 9, quantity: 1, status: 'pristiglo', reservedAt: '2026-10-15' },    // Sanseverija
        { id: 5, plantId: 6, quantity: 1, status: 'otkazano', reservedAt: '2026-10-02' },     // Fikus elastika
    ]
}

const carts = ref<Record<number, CartItem[]>>(loadJson('vivarium.carts', {}))
watch(carts, v => saveJson('vivarium.carts', v), { deep: true })

const { currentUser } = useAuth()

// demo korpa za testiranje aplikacije
watch(currentUser, user => {
    if (user && !carts.value[user.id]) carts.value[user.id] = demoItems()
}, { immediate: true })

const items = computed(() => (currentUser.value ? carts.value[currentUser.value.id] ?? [] : []))

const pendingCount = computed(() => items.value.filter(i => i.status === 'nepotvrđeno').length)

const today = () => new Date().toISOString().slice(0, 10)

export function useCart() {
    function find(id: number) {
        return items.value.find(i => i.id === id)
    }

    // dodaje biljku u korpu kao nepotvrdjenu
    function add(plantId: number, quantity: number) {
        const list = items.value
        const existing = list.find(i => i.plantId === plantId && i.status === 'nepotvrđeno')
        // dodaje kolicinu umesto da pravi ceo isti nov plant
        if (existing) {
            existing.quantity += quantity
            return
        }
        list.push({
            id: Math.max(0, ...list.map(i => i.id)) + 1,
            plantId,
            quantity,
            status: 'nepotvrđeno',
            reservedAt: today(),
        })
    }

    // potvrdjuje sve nepotvrdjenje iz korpe
    function confirmAll(): number {
        const pending = items.value.filter(i => i.status === 'nepotvrđeno')
        for (const item of pending) {
            item.status = 'rezervisano'
            item.reservedAt = today()
        }
        return pending.length
    }

    function setQuantity(id: number, quantity: number) {
        const item = find(id)
        if (item) item.quantity = quantity
    }

    function cancel(id: number) {
        const item = find(id)
        if (item) item.status = 'otkazano'
    }

    // pravi novu listu bez removed biljke
    function remove(id: number) {
        if (currentUser.value) {
            carts.value[currentUser.value.id] = items.value.filter(i => i.id !== id)
        }
    }

    function rate(id: number, rating: number) {
        const item = find(id)
        if (item) item.rating = rating
    }

    return { items, pendingCount, add, confirmAll, setQuantity, cancel, remove, rate }
}
