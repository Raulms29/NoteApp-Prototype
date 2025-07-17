<template>
    <n-dropdown trigger="hover" :options="getMenuOptions()" @select="handleSelect" class="note-options-dropdown">
        <template #default>
            <button class="note-options-trigger-btn" aria-label="Note options">
                <component :is="icon || DotsVertical" />
            </button>
        </template>
    </n-dropdown>
</template>

<script lang="ts" setup>
import DotsVertical from 'icons/DotsVertical.vue';
import { getNIcon } from '../../../utils/icons';
import FilePlusOutline from 'icons/FilePlusOutline.vue';
import Delete from 'icons/Delete.vue';

const emit = defineEmits(['create', 'delete']);

defineProps<{ icon?: any }>();

function getMenuOptions() {
    return [
        {
            label: 'New Note',
            key: 'new',
            icon: getNIcon(FilePlusOutline),
        },
        {
            label: 'Delete',
            key: 'delete',
            icon: getNIcon(Delete)
        }
    ]
}

function handleSelect(key: string) {
    if (key === 'new') emit('create');
    if (key === 'delete') emit('delete');
}
</script>

<style>
.note-options-trigger-btn {
    color: var(--primary-color, #007bff);
    border: none;
    outline: none;
    border-radius: 6px;
    padding: 1px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    width: 22px;
    height: 22px;
}

.note-options-trigger-btn:hover {
    background: var(--primary-color, #007bff);
    color: #fff;
}
</style>
