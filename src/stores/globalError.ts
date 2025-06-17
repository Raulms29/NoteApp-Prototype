import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGlobalError = defineStore('globalError', () => {
    const globalError = ref<string | null>(null);

    function setError(error: unknown) {
        globalError.value = typeof error === 'string' ? error : (error as Error).message ?? 'Unknown error';
    }

    function clearError() {
        globalError.value = null;
    }

    return {
        globalError,
        setError,
        clearError
    };
});
