import { ref } from "vue";
import axios from "axios";

function getPlantUrl(id: number) {
    const paddedId = String(id).padStart(3, '0')
    return `https://plants.pequla.com/images/biljka-${paddedId}.svg`
}



const plants = ref<Plant[]>([])
const loading = ref(false)
const error = ref<any>(null)

export interface Plant {
    id: number
    name: string
    latinName: string
    description: string
    plantingInstructions: string
    careInstructions: string
    plantType: string
    targetAudience: string
    lightRequirement: string
    watering: string
    intendedUse: string
    productionDate: string
    price: number
    currency: string
    imageUrl: string
    imageAlt: string
    isAvailable: boolean
    stockQuantity: number
    categoryId: number
    category: string
    climateId: number
    climate: string
    seasonId: number
    season: string
}

async function fetchPlants() {
        loading.value = true
        error.value = null
        try {
            const rsp = await axios.request({
                method: 'GET',
                url: 'https://plants.pequla.com/api/plants',
                headers: {
                    'Accept': 'application/json',
                    'X-Name': 'Pki-2026'
                }

            })

            plants.value = rsp.data.map((obj: any) => ({
                id: obj.id,
                name: obj.name,
                latinName: obj.latin_name,
                description: obj.description,
                plantingInstructions: obj.planting_instructions,
                careInstructions: obj.care_instructions,
                plantType: obj.plant_type,
                targetAudience: obj.target_audience,
                lightRequirement: obj.light_requirement,
                watering: obj.watering,
                intendedUse: obj.intended_use,
                productionDate: obj.production_date,
                price: obj.price,
                currency: obj.currency,
                imageUrl: getPlantUrl(obj.id),
                imageAlt: obj.image_alt,
                isAvailable: obj.is_available,
                stockQuantity: obj.stock_quantity,
                categoryId: obj.category_id,
                category: obj.category,
                climateId: obj.climate_id,
                climate: obj.climate,
                seasonId: obj.season_id,
                season: obj.season
            }));
        } catch (err) {
            error.value = err
        } finally {
            loading.value = false
        }
}

export function usePlants() {
    // fetchuje samo jednom, ostali koji pozivaju istu funkciju dele isti ref
    if (!loading.value && plants.value.length === 0) fetchPlants()
    return { plants, loading, error, fetchPlants }
}
