import { useRoute, useRouter } from 'vue-router'
import type { Plant } from './usePlants'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

// Single entry point for "Reserve" so every button behaves the same.
// Must be called from a component's setup (uses the router).
// TODO (cart step): add the plant to the user's cart with status 'rezervisano'.
export function useReservation() {
    const route = useRoute()
    const router = useRouter()
    const { isLoggedIn } = useAuth()
    const { show } = useToast()

    function reserve(plant: Plant, quantity = 1) {
        // Reserving needs an account: go to login, then come back to this page
        if (!isLoggedIn.value) {
            router.push({ name: 'login', query: { redirect: route.fullPath, reason: 'reserve' } })
            return
        }
        show({
            title: 'Biljka je rezervisana',
            message: `${quantity} × ${plant.name} je dodato u vašu korpu rezervacija.`,
            // TODO (cart step): action: { label: 'Prikaži korpu', to: { name: 'cart' } },
        })
    }

    return { reserve }
}
