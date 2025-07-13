import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGlobalError = defineStore('globalError', () => {
    const globalError = ref<string | null>(null);

    function setError(error: Error) {
        globalError.value = error.message;
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