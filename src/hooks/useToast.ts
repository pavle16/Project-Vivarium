import { ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

export type ToastVariant = 'success' | 'info' | 'warning' | 'danger'

export interface Toast {
    id: number
    title: string
    message?: string
    variant: ToastVariant
    action?: { label: string; to: RouteLocationRaw }
}

const toasts = ref<Toast[]>([])
let nextId = 1

export function useToast() {
    function dismiss(id: number) {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    function show(toast: Omit<Toast, 'id' | 'variant'> & { variant?: ToastVariant }, durationMs = 5000) {
        const id = nextId++
        toasts.value.push({ variant: 'success', ...toast, id })
        setTimeout(() => dismiss(id), durationMs)
    }

    return { toasts, show, dismiss }
}
