import springImg from '@/assets/seasons/spring.svg'
import summerImg from '@/assets/seasons/summer.svg'
import autumnImg from '@/assets/seasons/autumn.svg'
import winterImg from '@/assets/seasons/winter.svg'

export const SEASON_YEAR_ROUND = 1

export interface SeasonInfo {
    id: number
    label: string
    plantsLabel: string
    icon: string
    tagline: string
    image?: string // home page banner illustration
}

export const SEASONS: Record<number, SeasonInfo> = {
    1: { id: 1, label: 'Cela godina', plantsLabel: 'biljke za celu godinu', icon: 'fa-solid fa-infinity', tagline: 'Biljke koje uspevaju u svakoj sezoni.' },
    2: { id: 2, label: 'Jesen', plantsLabel: 'jesenje biljke', icon: 'fa-solid fa-leaf', tagline: 'Posadite lukovice i drveće sada za snažan početak naredne godine.', image: autumnImg },
    3: { id: 3, label: 'Leto', plantsLabel: 'letnje biljke', icon: 'fa-solid fa-sun', tagline: 'Dugi dani i topla zemlja. Idealno za voće i povrće.', image: summerImg },
    4: { id: 4, label: 'Proleće', plantsLabel: 'prolećne biljke', icon: 'fa-solid fa-seedling', tagline: 'Najbolje vreme za setvu i presađivanje rasada.', image: springImg },
    5: { id: 5, label: 'Zima', plantsLabel: 'zimske biljke', icon: 'fa-solid fa-snowflake', tagline: 'Otporne biljke i sobno zelenilo za hladne mesece.', image: winterImg },
}

// trenutno godisnje doba
export function currentSeason(date = new Date()): SeasonInfo {
    const m = date.getMonth() // 0 = January
    if (m >= 2 && m <= 4) return SEASONS[4]! // Mar–May
    if (m >= 5 && m <= 7) return SEASONS[3]! // Jun–Aug
    if (m >= 8 && m <= 10) return SEASONS[2]! // Sep–Nov
    return SEASONS[5]! // Dec–Feb
}
