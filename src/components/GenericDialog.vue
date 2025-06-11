<template>
    <div class="generic-dialog-backdrop">
        <div class="generic-dialog">
            <div class="generic-dialog-title">{{ title }}</div>
            <div class="generic-dialog-content">
                <div class="generic-dialog-text">{{ text }}</div>
                <slot name="content" />
            </div>
            <div class="generic-dialog-actions">
                <slot name="actions" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

defineProps<{
    title: string,
    text: string
}>()
</script>

<style>
.generic-dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.25);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.generic-dialog {
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.18);
    min-width: 22rem;
    max-width: 90vw;
    padding: 2rem 2rem 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.generic-dialog-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.generic-dialog-text {
    font-size: 1rem;
    color: #444;
    margin-bottom: 0.5rem;
}

.generic-dialog-content {
    margin-bottom: 1rem;
}

.generic-dialog-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.generic-dialog-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 1rem;
    background: #f8fafc;
    color: #222;
    outline: none;
    transition: border-color 0.2s;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.generic-dialog-input:focus {
    border-color: #6366f1;
    background: #fff;
}
</style>
