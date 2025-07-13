<template>
    <div v-if="message" class="generic-error-message">
        {{ message }}
    </div>
</template>

<script setup lang="ts">
defineProps<{
    message: string | null
}>()
</script>

<style scoped>
.generic-error-message {
    color: #e74c3c;
    background: #fff0f0;
    border: 1px solid #e74c3c;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    margin: 0.5rem 0;
    font-size: 1rem;
}
</style>
