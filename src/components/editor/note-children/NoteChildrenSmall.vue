<template>
    <div class="note-children-small">
        <div v-for="note in notes" :key="note.id" class="note-child-small" @click="$emit('select', note)">
            <span class="note-child-icon-small">
                <img v-if="note.hasChildren()" src="../../../assets/icons/note-children.svg" alt="Note child icon" />
                <img v-else src="../../../assets/icons/note-no-children.svg" alt="Note icon" />
            </span>
            <span class="note-child-name-small">{{ note.name }}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Note } from '../../../services/domain/Note';
defineProps<{ notes: Note[] }>();
const emit = defineEmits(['select']);
</script>

<style scoped>
.note-children-small {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 1rem 0;
}

.note-child-small {
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
    background: var(--background-color);
}

.note-child-small:hover {
    background: var(--background-hover, #f3f3f3);
}

.note-child-icon-small {
    display: flex;
    align-items: center;
    margin-right: 0.75rem;
    width: 1.5rem;
    height: 1.5rem;
}

.note-child-icon-small img {
    width: 100%;
    height: auto;
    display: block;
}

.note-child-name-small {
    font-size: 1rem;
    color: var(--sidebar-text-color, #333);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
