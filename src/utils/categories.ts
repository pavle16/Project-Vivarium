// Plant categories as returned by the plants API (category_id / category).
// Used for icons and for the "favourite plant types" in the user profile.

export interface CategoryInfo {
    id: number
    name: string
    icon: string
}

export const CATEGORIES: CategoryInfo[] = [
    { id: 1, name: 'Baštensko cveće', icon: 'fa-solid fa-spa' },
    { id: 2, name: 'Drveće i žbunje', icon: 'fa-solid fa-tree' },
    { id: 3, name: 'Povrće', icon: 'fa-solid fa-carrot' },
    { id: 4, name: 'Sobne biljke', icon: 'fa-solid fa-house' },
    { id: 5, name: 'Sukulenti i kaktusi', icon: 'fa-solid fa-sun' },
    { id: 6, name: 'Voće', icon: 'fa-solid fa-apple-whole' },
    { id: 7, name: 'Začinsko i aromatično bilje', icon: 'fa-solid fa-mortar-pestle' },
]

export function categoryIcon(id: number): string {
    return CATEGORIES.find(c => c.id === id)?.icon ?? 'fa-solid fa-leaf'
}
