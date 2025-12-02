import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Pinia store for managing global error state in the application.
 */
export const useGlobalError = defineStore('globalError', () => {
    const globalError = ref<string | null>(null);

    /**
     * Sets the global error message from an Error object.
     * @param error - The error to set.
     */
    function setError(error: Error) {
        globalError.value = error.message;
    }

    /**
     * Clears the global error message.
     */
    function clearError() {
        globalError.value = null;
    }

    return {
        globalError,
        setError,
        clearError
    };
});