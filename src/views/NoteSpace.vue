<template>
    <div class="note-space-container">
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
import 'splitpanes/dist/splitpanes.css';
import '../styles/splitpanes.css';
import { Splitpanes, Pane } from 'splitpanes';

</script>

<style scoped>
.note-space-container {
    height: 100vh;
    overflow: hidden;
}

.sidebar-pane {
    background-color: #fff;
    overflow-y: auto;
    height: 100%;
}

.editor-pane {
    overflow-y: auto;
    background-color: #fff;
    height: 100%;
    margin: 0.5rem;
}
</style>