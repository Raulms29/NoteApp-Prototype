<template>
    <!-- Current Item  -->
    <div class="flex items-center cursor-pointer py-1 px-2 rounded hover:bg-gray-200 w-full"
        @click="$emit('selectNote', note)" :class="{ 'bg-blue-100': note.id === selectedNote?.id }">
        <!-- Expand/Collapse Button -->
        <div class="flex-1 truncate" :class="{ 'ml-4': !store.noteTree.some((n: Note) => n.id === note.id) }">
            <button v-if="note.children.length > 0" class="mr-1 text-xs w-4"
                @click.stop="$emit('toggleExpand', note.id)">
                {{ isExpanded(note.id) ? '▾' : '▸' }}
            </button>
            {{ note.name || 'Untitled' }}
        </div>
    </div>
    <!-- Child Items -->
    <SidebarItem v-if="isExpanded(note.id)" v-for="child in note.children" :key="child.id" :note="child"
        :selected-note="selectedNote" :is-expanded="isExpanded" @selectNote="$emit('selectNote', $event)"
        @toggleExpand="$emit('toggleExpand', $event)" />
</template>

<script setup lang="ts">
import { useNotesStore } from '../../stores/useNotesStore'
import { Note } from '../../services/domain/Note'

const store = useNotesStore()

defineProps<{
    note: Note
    selectedNote: Note | null
    isExpanded: (id: string) => boolean
}>()

defineEmits<{
    (e: 'selectNote', note: Note): void
    (e: 'toggleExpand', id: string): void
}>()
</script>
