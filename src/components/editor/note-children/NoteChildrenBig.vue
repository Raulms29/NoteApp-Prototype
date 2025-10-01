<template>
    <div class="note-children">
        <div v-for="note in notes" :key="note.id" class="note-child-big" @click="$emit('select', note)">
            <div class="note-child-img-container">
                <div class="note-child-top-bar">
                    <ChildrenOptions @create="$emit('create', note)" @delete="$emit('delete', note)" />
                </div>
                <img v-if="note.hasChildren()" src="../../../assets/icons/note-children.svg" alt="Note child icon"
                    class="note-child-icon-big" />
                <img v-else src="../../../assets/icons/note-no-children.svg" alt="Note icon"
                    class="note-child-icon-big" />
            </div>
            <p class="text-lg text-gray-700 dark:text-gray-300 text-center w-full">
                {{ note.name }}
            </p>
        </div>

    </div>

</template>

<script lang="ts" setup>
import { Note } from '../../../business/domain/Note';
defineProps<{ notes: Note[] }>();
const emit = defineEmits(['select', 'create', 'delete']);
</script>

<style scoped>
.note-children {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    margin: 1rem;
}

.note-child-big {
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

.note-child-big:hover {
    background: var(--background-hover, #f3f3f3);
}

.note-child-icon-big {
    width: 50%;
    height: auto;
    margin-bottom: 0.5rem;
}

.note-child-img-container {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.note-child-top-bar {
    position: absolute;
    margin-right: 0.25rem;
    margin-top: 0.25rem;
    padding: 0;
    top: 0;
    right: 0;
    z-index: 2;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    pointer-events: auto;
}
</style>
