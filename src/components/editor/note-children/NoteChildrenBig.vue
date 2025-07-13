<template>
    <div class="note-children">
        <div v-for="note in notes" :key="note.id" class="note-child text-center" @click="$emit('select', note)">
            <img v-if="note.hasChildren()" src="../../../assets/icons/note-children.svg" alt="Note child icon"
                class="note-child-icon" />
            <img v-else src="../../../assets/icons/note-no-children.svg" alt="Note icon" class="note-child-icon" />
            <p class="text-lg text-gray-700 dark:text-gray-300 text-center w-full">
                {{ note.name }}
            </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Note } from '../../../services/domain/Note';
defineProps<{ notes: Note[] }>();
const emit = defineEmits(['select']);
</script>

<style scoped>
.note-children {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    margin: 1rem;
}

.note-child {
    background: var(--background-color);
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    min-width: 120px;
    min-height: 48px;
    border-radius: 8px;
    flex-direction: column;
}

.note-child:hover {
    background: var(--background-hover, #f3f3f3);
}

.note-child-icon {
    width: 50%;
    height: auto;
    margin-bottom: 0.5rem;
}
</style>
