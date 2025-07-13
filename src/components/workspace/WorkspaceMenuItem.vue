<template>
    <div class="menu-item" @click.stop="onClick">
        <slot name="icon"></slot>
        <span>{{ label }}</span>
    </div>
</template>

<script lang="ts" setup>

defineProps<{
    label: string
}>()

const emit = defineEmits<
    (e: 'action') => void
>()

function onClick() {
    emit('action')
}
</script>

<style scoped>
.menu-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background 0.15s;
    justify-content: left;
}

.menu-item:hover {
    background: #f3f4f6;
}
</style>
