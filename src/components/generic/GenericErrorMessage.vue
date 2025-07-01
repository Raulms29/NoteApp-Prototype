<template>
    <div class="generic-error-message">
        {{ message }}
    </div>
</template>

<script setup lang="ts">
defineProps<{
    message: string | null,
}>();
</script>

<style>
.generic-error-message {
    margin: 0 auto;
    background: #e74c3c;
    color: #fff;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.08);
    max-width: 26.25rem;
    z-index: 100;
    text-align: center;
    animation: fadeIn 0.2s;
    pointer-events: none;
}
</style>
