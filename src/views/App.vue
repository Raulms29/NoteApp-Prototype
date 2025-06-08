<template>
    <div class="app-container">
        <splitpanes class="split-theme">
            <pane min-size="12.5" max-size="60" size="15">
                <div class="sidebar-pane">
                    <Sidebar />
                </div>
            </pane>
            <pane>
                <div class="editor-pane">
                    <Editor />
                </div>
            </pane>
        </splitpanes>
    </div>
</template>

<script setup lang="ts">
import { useNotesStore } from '../stores/useNotesStore';
import 'splitpanes/dist/splitpanes.css';
import '../styles/splitpanes.css';
import { Splitpanes, Pane } from 'splitpanes';

useNotesStore().init("D:\\TFG\\Notes");
</script>

<style scoped></style>