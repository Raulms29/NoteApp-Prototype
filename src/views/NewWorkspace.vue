<template>
    <div class="new-workspace-outer" :aria-busy="isSelecting" :class="{ 'disabled': isSelecting }">
        <!-- Arrow to go back -->
        <ArrowLeft class="back-arrow" @click="goBacktoWorkspaces" :size="40 as number" :title="'Worskpaces'" />

        <!-- Title -->
        <h2 class="new-workspace-title">Create new Workspace</h2>

        <!-- Form to create new workspace -->
        <form ref="formRef" class="new-workspace-form" @submit.prevent="handleCreate">
            <div class="form-row">
                <label class="form-label" for="workspace-name">Name</label>
                <input id="workspace-name" ref="nameInputRef" v-model="name" type="text" class="form-input"
                    placeholder="Workspace name" required />
            </div>
            <div class="form-row">
                <label class="form-label" for="workspace-location">Location</label>
                <div class="location-row">
                    <span class="location-text">Your new workspace will be placed in: <span class="font-medium">{{
                        location
                            }}</span></span>
                    <GenericButton type="button" class="browse-btn" @click="selectLocation">Browse</GenericButton>
                </div>
            </div>
            <input id="workspace-location" ref="locationInputRef" v-model="location" type="text" class="form-input"
                style="display:none" tabindex="-1" aria-hidden="true" />
            <div class="form-row center">
                <GenericButton type="submit" class="create-btn" variant="primary">Create
                </GenericButton>
            </div>
        </form>

        <!-- Loading when selecting folder -->
        <LoadingOverlay v-if="isSelecting" />

        <!-- Error message dialog -->
        <GenericDialog :text="errorMessage" title="Error" v-if="errorMessage != ''">
            <template #actions>
                <GenericButton variant="danger" @click="errorMessage = ''">Close</GenericButton>
            </template>
        </GenericDialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ArrowLeft from 'icons/ArrowLeft.vue'
import GenericButton from '../components/generic/GenericButton.vue'
import LoadingOverlay from '../components/loading/LoadingOverlay.vue'
import GenericDialog from '../components/generic/GenericDialog.vue'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import { Workspace } from '../services/domain/Workspace'
import { useRouter } from 'vue-router'

const name = ref('')
const location = ref('')
const isSelecting = ref(false)
const errorMessage = ref('')
const workspaceStore = useWorkspaceStore()
const formRef = ref<HTMLFormElement | null>(null)
const nameInputRef = ref<HTMLInputElement | null>(null)
const locationInputRef = ref<HTMLInputElement | null>(null)
const router = useRouter()

async function selectLocation() {
    isSelecting.value = true
    try {
        const folder = await window.fileAPI.selectFolder();
        if (folder) {
            location.value = folder;
        }
    } finally {
        isSelecting.value = false
    }
}

async function handleCreate() {
    try {
        workspaceStore.validateWorkspace(name.value, location.value);
    } catch (e) {
        errorMessage.value = e.message;
        return;
    }

    await workspaceStore.addWorkspace(new Workspace(name.value.trim(), location.value.trim()));
    router.push({ name: 'workspace' });
}

function goBacktoWorkspaces() {
    router.replace({ name: 'workspace' });
}
</script>

<style scoped>
.new-workspace-outer {
    max-width: 90vw;
    margin: 0 auto;
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    overflow: visible;
    position: relative;
    padding-top: 2.5rem;
}

.back-arrow {
    position: absolute;
    cursor: pointer;
    padding: 0.25rem;
    transition: background 0.2s;
}

.back-arrow:hover {
    background: #f3f3f3;
    border-radius: 50%;
}

.new-workspace-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 2rem;
    text-align: center;
    margin-top: 0.5rem;
}

.new-workspace-form {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    width: 100%;
    align-items: center;
    padding: 0.5rem;
    margin-top: 0;
}

.form-row {
    display: flex;
    align-items: center;
    gap: 2.5rem;
    width: 100%;
    justify-content: center;
}

.form-row.center {
    justify-content: center;
}

.form-label {
    font-size: 1.35rem;
    width: 10%;
    text-align: right;
    font-weight: 600;
}

.form-input {
    flex: 1;
    font-size: 1.1rem;
    padding: 0.75rem 1.25rem;
    border: 1.5px solid #bbb;
    border-radius: 0.5rem;
    outline: none;
    transition: border 0.2s;
}

.form-input:focus {
    border: 2px solid #1976d2;
}

.location-row {
    display: flex;
    align-items: center;
    gap: 2.5rem;
    flex: 1;
    justify-content: space-between;
}

.location-text {
    font-size: 1.15rem;
    color: #222;
}

.browse-btn {
    min-width: unset;
    font-size: 1rem;
    padding: 0.5rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.create-btn {
    font-size: 1.18rem;
    padding: 0.7rem 2.1rem;
    border-radius: 0.75rem;
}
</style>
