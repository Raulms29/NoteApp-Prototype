<template>
    <div class="workspace-card workspace-card-base" @click="$emit('selectWorkspace', workspace)">
        <!-- Workspace Info -->
        <div class="workspace-card-info">
            <div class="workspace-name">{{ workspace.name }}</div>
            <div class="workspace-path">{{ workspace.path }}</div>
        </div>
        <div class="workspace-card-dots" ref="dotsRef" @click.stop="toggleMenu">
            ⋯
        </div>

        <!-- Menu -->
        <teleport to="body">
            <transition name="workspace-card-menu">
                <div v-if="showMenu" class="workspace-card-menu " :style="menuStyle" @click.stop ref="menuRef">
                    <WorkspaceMenuItem label="Rename" @click="showRename = true; showMenu = false">
                        <template #icon>
                            <MaterialDesignPencil class="workspace-card-icon" />
                        </template>
                    </WorkspaceMenuItem>
                    <WorkspaceMenuItem label="Delete" @click="showDelete = true; showMenu = false">
                        <template #icon>
                            <MaterialDesignDelete class="workspace-card-icon" />
                        </template>
                    </WorkspaceMenuItem>
                </div>
            </transition>
        </teleport>

        <!--Dialogs-->
        <teleport to="body">
            <RenameDialog v-if="showRename" :name="workspace.name" @cancel="showRename = false"
                @rename="handleRename" />
            <RemoveDialog v-if="showDelete" :name="workspace.name" @cancel="showDelete = false"
                @remove="handleDelete" />
        </teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { WorkspaceI } from 'src/services/domain/Workspace';
import WorkspaceMenuItem from './WorkspaceMenuItem.vue'
import MaterialDesignPencil from 'icons/Pencil.vue'
import MaterialDesignDelete from 'icons/Delete.vue'
import RenameDialog from './dialog/RenameDialog.vue'

const props = defineProps<{ workspace: WorkspaceI }>()

const emit = defineEmits<{
    (e: 'selectWorkspace', workspace: WorkspaceI): void,
    (e: 'renameWorkspace', workspace: WorkspaceI, newName: string): void,
    (e: 'removeWorkspace', workspace: WorkspaceI): void,
}>()

// Dialog and menus
const showMenu = ref(false)
const showRename = ref(false)
const showDelete = ref(false)

// Refs for menu positioning
const menuStyle = ref('')
const dotsRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

function toggleMenu() {
    showMenu.value = !showMenu.value;
    if (showMenu.value === true) {
        openMenu();
    }
    else {
        menuStyle.value = '';
    }
}


function openMenu() {
    nextTick(() => {
        const rect = dotsRef.value?.getBoundingClientRect()
        if (rect) {
            // Position menu below and aligned to the left of the dots
            menuStyle.value = `position: fixed; left: ${rect.left}px; top: ${rect.bottom + 4}px; z-index: 9999;`;
        }
    })
}

function handleClickOutside(event: MouseEvent) {
    if (showMenu.value) {
        const menu = menuRef.value;
        if (menu && !menu.contains(event.target as Node) && !dotsRef.value?.contains(event.target as Node)) {
            showMenu.value = false;
        }
    }
}

function handleRename(newName: string) {
    emit('renameWorkspace', props.workspace, newName);
    showRename.value = false;
}

function handleDelete() {
    emit('removeWorkspace', props.workspace);
    showDelete.value = false;
}

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style>
.workspace-card-base {
    background: #fafafa;
    border-radius: 0.75rem;
    box-shadow: 0 0.25rem 0.625rem rgba(0, 0, 0, 0.2);
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.workspace-card {
    justify-content: space-between;
    width: 100%;

}

.workspace-card-info {
    display: flex;
    flex-direction: column;
}

.workspace-name {
    font-weight: bold;
    margin-bottom: 0.25rem;
    font-size: 1.125rem;
}

.workspace-path {
    color: #555;
    font-size: 0.875rem;
}

.workspace-card-dots {
    position: relative;
    font-size: 1.25rem;
    cursor: pointer;
    user-select: none;
}

.workspace-card-menu {
    position: absolute;
    right: 0;
    top: 1.5rem;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.15);
    width: fit-content;
    z-index: 10;
    padding: 0.25rem 0;
    min-width: 7.5rem;

    /* Animation */
    transform: translateY(-0.5rem) scale(0.98);
    transition: opacity 0.18s cubic-bezier(.4, 0, .2, 1), transform 0.18s cubic-bezier(.4, 0, .2, 1);
}

.workspace-card-menu.workspace-card-menu-enter-active,
.workspace-card-menu.workspace-card-menu-leave-active {
    transition: opacity 0.18s cubic-bezier(.4, 0, .2, 1), transform 0.18s cubic-bezier(.4, 0, .2, 1);
}

.workspace-card-menu.workspace-card-menu-enter-from,
.workspace-card-menu.workspace-card-menu-leave-to {
    opacity: 0;
    transform: translateY(-0.5rem) scale(0.98);
}

.workspace-card-menu.workspace-card-menu-enter-to,
.workspace-card-menu.workspace-card-menu-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}

.workspace-card-icon {
    width: 1rem;
    height: 1rem;
    stroke: #555;
}
</style>