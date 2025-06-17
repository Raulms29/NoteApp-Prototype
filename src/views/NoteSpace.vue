<template>
    <div class="note-space-container">
        <splitpanes class="split-theme">
            <pane min-size="12.5" max-size="50" size="14.5">
                <div class="flex-1 truncate pl-3 text-xl font-bold workspace-title select-none m-1">
                    <VectorTriangle class="mr-2" />
                    {{ workspaceStore.currentWorkspace?.name }}
                </div>
                <hr class="sidebar-separator" />
                <div class="sidebar-pane">
                    <Sidebar />
                </div>
            </pane>
            <pane>
                <div class="editor-pane">
                    <EditorView />
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
import VectorTriangle from 'icons/VectorTriangle.vue';

const workspaceStore = useWorkspaceStore();
</script>

<style scoped>
.note-space-container {
    height: 100vh;
    overflow: hidden;
}

.editor-pane {
    overflow-y: auto;
    background-color: var(--background-color);
    height: 98vh;
    overflow: none;
}

.sidebar-pane {
    background-color: var(--background-color);
    height: 100%;
}

.sidebar-separator {
    border-top: 2px solid var(--sidebar-text-separator-color);
    border-radius: 6px;
}

.workspace-title {
    color: var(--sidebar-text-separator-color);
    display: flex;
    align-items: start;
}
</style>