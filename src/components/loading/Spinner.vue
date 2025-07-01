<template>
    <div class="spinner" :class="customClass"></div>
</template>

<script setup lang="ts">
defineProps<{ customClass?: string }>()
</script>

<style scoped>
.spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 4px solid #bbb;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
