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
                    <EditorView ref="editorViewRef" />
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
import { ref, onMounted, onUnmounted } from 'vue';

const workspaceStore = useWorkspaceStore();
const settingsStore = useSettingsStore();
const notesStore = useNotesStore();


const smallScreenPaneMinSize = 20;
const largeScreenPaneMinSize = 12.5;
const paneMinSize = ref(largeScreenPaneMinSize);
const editorViewRef = ref<any>(null);

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
</style>