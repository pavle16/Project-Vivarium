<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useToast, type ToastVariant } from '@/hooks/useToast'

const { toasts, dismiss } = useToast()

const ICONS: Record<ToastVariant, string> = {
    success: 'fa-solid fa-circle-check text-success',
    info: 'fa-solid fa-circle-info text-primary',
    warning: 'fa-solid fa-triangle-exclamation text-warning',
    danger: 'fa-solid fa-circle-xmark text-danger',
}
</script>

<template>
    <div class="toast-container position-fixed bottom-0 end-0 p-3" aria-live="polite" aria-atomic="true">
        <TransitionGroup name="toast">
            <div v-for="t in toasts" :key="t.id" class="toast show shadow" role="status">
                <div class="toast-header">
                    <i :class="ICONS[t.variant]" class="me-2"></i>
                    <strong class="me-auto">{{ t.title }}</strong>
                    <button type="button" class="btn-close" aria-label="Zatvori" @click="dismiss(t.id)"></button>
                </div>
                <div v-if="t.message || t.action" class="toast-body d-flex align-items-center gap-2">
                    <span class="me-auto">{{ t.message }}</span>
                    <RouterLink v-if="t.action" :to="t.action.to" class="btn btn-sm btn-primary text-nowrap"
                        @click="dismiss(t.id)">
                        {{ t.action.label }}
                    </RouterLink>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.toast-container {
    z-index: 1090;
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(1rem);
}
</style>
