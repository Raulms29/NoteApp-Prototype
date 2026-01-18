<template>
    <div class="note-space-container">
        <splitpanes class="split-theme">
            <pane :min-size="paneMinSize" max-size="50" size="14.5" v-if="!settingsStore.settings.focusMode">
                <div id="workspaceTitle"
                    class="flex items-center gap-2 flex-1 truncate pl-3 text-xl font-bold select-none m-1">
                    <img src="../assets/app-icon/png/1024x1024.png" class="h-8" alt="App icon"></img>
                    {{ workspaceStore.currentWorkspace?.name }}
                </div>
                <hr class="sidebar-separator" />
                <div class="sidebar-pane">
                    <Sidebar />
                </div>
            </pane>
            <pane>
                <div class="editor-pane" id="editorPane" @click="onEditorPaneClick">
                    <EditorView ref="editorViewRef" v-if="hasNotes" />
                    <div class="empty-state" v-else>
                        <div class="empty-header">
                            <div class="empty-message">This seems quite empty...</div>
                        </div>
                        <GenericButton variant="primary" @click="handleNewNote">
                            <FilePlusOutline /> Create Note
                        </GenericButton>
                    </div>
                </div>
            </pane>
        </splitpanes>
    </div>
</template>

<script setup lang="ts">
import 'splitpanes/dist/splitpanes.css';
import '../styles/splitpanes.css';
import { Splitpanes, Pane } from 'splitpanes';
import { useWorkspaceStore } from '../stores/useWorkspaceStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useNotesStore } from '../stores/useNotesStore';
import GenericButton from '../components/generic/GenericButton.vue';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import FilePlusOutline from 'icons/FilePlusOutline.vue';
const workspaceStore = useWorkspaceStore();
const settingsStore = useSettingsStore();
const notesStore = useNotesStore();


const smallScreenPaneMinSize = 20;
const largeScreenPaneMinSize = 12.5;
const paneMinSize = ref(largeScreenPaneMinSize);
const editorViewRef = ref<any>(null);

const hasNotes = computed(() => {
    return (notesStore.noteTree?.length ?? 0) > 0;
});

async function handleNewNote() {
    const newNote = await notesStore.createNote();
    if (newNote) {
        notesStore.selectNote(newNote);
    }
}

function updateMinSize() {
    if (window.innerWidth < 1200) {
        paneMinSize.value = smallScreenPaneMinSize;
    } else {
        paneMinSize.value = largeScreenPaneMinSize;
    }
}

onMounted(() => {
    updateMinSize();
    window.addEventListener('resize', updateMinSize);

    const lastNoteAccessed = notesStore.getLastNoteAccesed();
    if (notesStore.firstNoteAccess && settingsStore.settings.rememberLastNote && lastNoteAccessed !== null) {
        notesStore.selectNote(lastNoteAccessed);
    }
    notesStore.firstNoteAccess = true;
});

onUnmounted(() => {
    window.removeEventListener('resize', updateMinSize);
});

function onEditorPaneClick(event: MouseEvent) {
    editorViewRef.value?.handleEditorWrapperClick?.(event);
}

</script>

<style scoped>
.note-space-container {
    height: 100%;
    overflow: hidden;
}

.editor-pane {
    overflow-y: auto;
    background-color: var(--background-color);
    height: 98vh;
}

.sidebar-pane {
    background-color: var(--background-color);
    height: 100%;
}

.sidebar-separator {
    border-top: 2px solid var(--sidebar-text-separator-color);
    border-radius: 6px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.75rem;
    padding: 1.5rem;
}

.empty-header {
    display: flex;
    align-items: center;
}

.empty-message {
    font-size: 1.75rem;
}

.empty-state .generic-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}
</style>