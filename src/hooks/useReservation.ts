import { useRoute, useRouter } from 'vue-router'
import type { Plant } from './usePlants'
import { useAuth } from './useAuth'
import { useCart } from './useCart'
import { useToast } from './useToast'

// mora se koristiti u <script> zbog routera

export function useReservation() {
    const route = useRoute()
    const router = useRouter()
    const { isLoggedIn } = useAuth()
    const { add } = useCart()
    const { show } = useToast()

    function reserve(plant: Plant, quantity = 1) {
        // rezervacija zahteva prijavljivanje 
        if (!isLoggedIn.value) {
            router.push({ name: 'login', query: { redirect: route.fullPath, reason: 'reserve' } })
            return
        }
        add(plant.id, quantity)
        show({
            title: 'Dodato u korpu',
            message: `${quantity} × ${plant.name}. Potvrdite rezervaciju u korpi.`,
            action: { label: 'Prikaži korpu', to: { name: 'cart' } },
        })
    }

    return { reserve }
}
