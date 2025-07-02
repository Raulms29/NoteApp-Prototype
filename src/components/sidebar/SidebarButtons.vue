<template>
    <div class="sidebar-buttons">
        <button class="sidebar-btn" title="Search" @click="emit('search')">
            <Magnify width="48" height="48" />
        </button>
        <button class="sidebar-btn" title="Change workspace" @click.stop="handleChangeWorkspace">
            <FolderSwapOutline width="48" height="48" />
        </button>
        <button class="sidebar-btn" title="New Note" @click="handleNewNote">
            <FilePlusOutline width="48" height="48" />
        </button>
    </div>
</template>
<script setup lang="ts">
import Magnify from 'icons/Magnify.vue';
import FolderSwapOutline from 'icons/FolderSwapOutline.vue';
import FilePlusOutline from 'icons/FilePlusOutline.vue';
import { useRouter } from 'vue-router';
import { useNotesStore } from '../../stores/useNotesStore';

const router = useRouter();
const notesStore = useNotesStore();

const emit = defineEmits<(e: 'search') => void>();

async function handleNewNote() {
    const newNote = await notesStore.createNote();
    if (newNote) {
        notesStore.selectNote(newNote);
    }
}

function handleChangeWorkspace() {
    notesStore.reset();
    router.replace({ name: 'workspace' })
}

</script>
<style>
.sidebar-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    margin-left: 1rem;
    margin-right: 1rem;
}

.sidebar-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem 0.5rem;
    border-radius: 0.5rem;
    transition: background 0.2s;
    width: fit-content;
}

.sidebar-btn:hover {
    background: #f0f0f0;
}
</style>