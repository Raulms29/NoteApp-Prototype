<template>
    <button :class="['generic-btn', variant]">
        <slot />
    </button>
</template>

<script setup lang="ts">
defineProps<{
    variant?: 'primary' | 'secondary' | 'danger'
}>()

</script>

<style scoped>
.generic-btn {
    padding: 0.45rem 1.1rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    border: none;
    outline: none;
    cursor: pointer;
    transition: background 0.18s, color 0.18s, box-shadow 0.18s;
    background: #f3f4f6;
    color: #222;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    margin-left: 0.25rem;
    margin-right: 0.25rem;
}

.generic-btn.primary {
    background: #6366f1;
    color: #fff;
}

.generic-btn.secondary {
    background: #f3f4f6;
    color: #222;
}

.generic-btn.danger {
    background: #ef4444;
    color: #fff;
}

.generic-btn:active {
    filter: brightness(0.97);
}

.generic-btn:focus {
    box-shadow: 0 0 0 2px #6366f1aa;
}
</style>
