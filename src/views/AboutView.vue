<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuth } from '@/hooks/useAuth'

const { isLoggedIn } = useAuth()

const STEPS = [
    { icon: 'fa-solid fa-magnifying-glass', title: 'Pronađite biljku', text: 'Pregledajte ponudu ili pretražite biljke po nazivu, opisu, tipu, ciljnoj grupi, datumu proizvodnje, ceni i ocenama.' },
    { icon: 'fa-solid fa-basket-shopping', title: 'Rezervišite', text: 'Prijavite se, kliknite „Dodaj u korpu“, a zatim u korpi proverite količine i kliknite „Potvrdi rezervaciju“.' },
    { icon: 'fa-solid fa-truck', title: 'Sačekajte da pristigne', text: 'Kada biljka pristigne, status rezervacije se menja u „pristiglo“.' },
    { icon: 'fa-solid fa-star', title: 'Ocenite biljku', text: 'Biljke koje su pristigle možete oceniti. Vaša ocena pomaže drugim kupcima pri izboru.' },
]

const STATUSES = [
    { label: 'nepotvrđeno', badge: 'text-bg-info', text: 'Biljka je u korpi, ali rezervacija još nije potvrđena. Možete promeniti količinu ili je ukloniti.' },
    { label: 'rezervisano', badge: 'text-bg-warning', text: 'Biljka je rezervisana i čeka isporuku. Možete promeniti količinu ili otkazati rezervaciju.' },
    { label: 'pristiglo', badge: 'text-bg-success', text: 'Biljka je stigla. Možete je oceniti i ukloniti iz korpe.' },
    { label: 'otkazano', badge: 'text-bg-secondary', text: 'Rezervacija je otkazana i biljka neće biti isporučena.' },
]
</script>

<template>
    <div class="my-4">
        <!-- Intro -->
        <section class="mb-5 col-lg-9">
            <h1 class="display-6 fw-bold mb-3">O Vivarijumu</h1>
            <p class="fs-5">
                Vivarium je digitalna prodavnica biljaka. Na jednom mestu možete pronaći sobne i baštenske biljke,
                povrće, voće, začinsko bilje, sukulente i drveće, uz uputstva za sadnju i negu za svaku biljku.
            </p>
            <p class="text-body-secondary mb-0">
                Biljke se ne kupuju odmah, već se rezervišu. Tako znate da će biljka biti sačuvana za vas, a mi
                vas obaveštavamo kada pristigne.
            </p>
        </section>

        <!-- How it works -->
        <section class="mb-5">
            <h2 class="h4 mb-3">Kako funkcioniše rezervacija</h2>
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
                <div v-for="(s, i) in STEPS" :key="s.title" class="col">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <span class="step rounded-circle bg-primary text-white fw-semibold">{{ i + 1 }}</span>
                                <i :class="s.icon" class="text-primary fs-5"></i>
                            </div>
                            <h3 class="h6 fw-semibold">{{ s.title }}</h3>
                            <p class="card-text small text-body-secondary mb-0">{{ s.text }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex flex-wrap gap-2 mt-3">
                <RouterLink class="btn btn-primary" :to="{ name: 'gallery' }">Pogledaj ponudu</RouterLink>
                <RouterLink v-if="!isLoggedIn" class="btn btn-outline-primary" :to="{ name: 'register' }">
                    Napravi nalog
                </RouterLink>
            </div>
        </section>

        <div class="row g-4 mb-4">
            <!-- Statuses -->
            <section class="col-lg-7">
                <h2 class="h4 mb-3">Statusi rezervacije</h2>
                <ul class="list-group">
                    <li v-for="s in STATUSES" :key="s.label" class="list-group-item d-flex gap-3 align-items-start py-3">
                        <span class="badge status-badge" :class="s.badge">{{ s.label }}</span>
                        <span class="small">{{ s.text }}</span>
                    </li>
                </ul>
            </section>

            <!-- Contact -->
            <section class="col-lg-5">
                <h2 class="h4 mb-3">Kontakt</h2>
                <div class="card">
                    <ul class="list-unstyled card-body mb-0">
                        <li class="mb-2"><i class="fa-solid fa-location-dot text-primary me-2"></i>Cvetna 1, 11000 Beograd</li>
                        <li class="mb-2"><i class="fa-solid fa-phone text-primary me-2"></i>011 123 4567</li>
                        <li class="mb-2"><i class="fa-solid fa-envelope text-primary me-2"></i>vivarium@primer.rs</li>
                        <li><i class="fa-solid fa-clock text-primary me-2"></i>Pon–Sub, 8–20h</li>
                    </ul>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
.step {
    width: 1.75rem;
    height: 1.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
}

.status-badge {
    min-width: 6.5rem;
}
</style>
