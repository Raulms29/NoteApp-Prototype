<template>
    <SidebarItem v-for="note in store.noteTree" :key="note.id" :note="note" :selected-note="store.currentNote as Note"
        :is-expanded="isExpanded" @selectNote="selectNote" @toggleExpand="toggleExpand" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNotesStore } from '../../stores/useNotesStore'
import { Note } from '../../services/domain/Note'

const store = useNotesStore()
console.log('Note tree:', store.noteTree)

// Set of expanded note IDs
const expanded = ref<Set<string>>(new Set())

function toggleExpand(id: string) {
    if (expanded.value.has(id)) {
        expanded.value.delete(id)
    } else {
        expanded.value.add(id)
    }
}

function isExpanded(id: string) {
    return expanded.value.has(id)
}

function selectNote(note: Note) {
    store.selectNote(note)
}
</script>
