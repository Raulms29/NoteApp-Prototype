<template>
    <div class="sidebar-container">
        <SidebarButtons @search="toggleSearch" />

        <transition name="fade-slide">
            <div v-if="showSearch" class="ml-2 mr-2">
                <n-input v-model:value="pattern" placeholder="Search" style="--n-border-hover: 1px solid #1976d2; --n-border-focus: 1px solid #1976d2; --n-caret-color: #1976d2; --n-loading-color: #1976d2;
                --n-box-shadow-focus: 0 0 0 2px rgba(25, 118, 210, 0.2);" />
            </div>
        </transition>

        <div class="sidebar-tree-scroll">
            <n-tree block-line draggable :data="data" :render-label="renderLabel" :expanded-keys="expandedKeys"
                @drop="handleDrop" @update:expanded-keys="handleExpandedKeysChange"
                :override-default-node-click-behavior="selectNote" :render-switcher-icon="renderSwitcherIcon"
                :pattern="pattern" :selected-keys="selectedKeys" :show-irrelevant-nodes="false"
                style="--n-drop-mark-color: #1976d2;" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { TreeDropInfo, TreeOption } from 'naive-ui'
import { NIcon, NDropdown, NButton } from 'naive-ui'
import { h, ref, watch } from 'vue'
import { useNotesStore } from '../../stores/useNotesStore'
import { Note } from '../../services/domain/Note'
import ChevronRight from 'icons/ChevronRight.vue'
import Delete from 'icons/Delete.vue'
import DotsHorizontal from 'icons/DotsHorizontal.vue'

const store = useNotesStore()

const expandedKeys = ref<string[]>([])
const data = ref<TreeOption[]>([])
const pattern = ref<string>('')
const showSearch = ref(false)
const selectedKeys = ref<string[]>([])

// Watch for changes in the note tree and update data
watch(
    () => store.noteTree,
    (noteTree) => {
        data.value = (noteTree || []).map(noteToTreeOption)
    },
    { immediate: true, deep: true }
)

// Watch for changes in the selected note and update selectedKeys
watch(
    () => store.currentNote,
    (currentNote) => {
        if (currentNote) {
            selectedKeys.value = [currentNote.id]
        } else {
            selectedKeys.value = []
        }
    },
    { immediate: true }
)

// --- Icon helpers ---
function getNIcon(icon: any) {
    return () => h(NIcon, null, { default: () => h(icon) })
}

// --- Tree option helpers ---
function noteToTreeOption(note: Note): TreeOption {
    let noteChildren = note.children?.map(noteToTreeOption)
    if (noteChildren && noteChildren.length === 0) {
        noteChildren = []
    }
    return {
        key: note.id,
        label: note.name,
        children: noteChildren,
        rawNote: note
    }
}

function getMenuOptions(option: TreeOption) {
    return [
        {
            label: 'Delete',
            key: 'delete',
            icon: getNIcon(Delete)
        }
    ]
}

// --- Tree event handlers ---
function handleExpandedKeysChange(keys: string[]) {
    expandedKeys.value = keys;
}

function handleDrop({ node, dragNode, dropPosition }: TreeDropInfo) {
    const [dragNodeSiblings, dragNodeIndex] = findSiblingsAndIndex(
        dragNode,
        data.value
    )
    if (dragNodeSiblings === null || dragNodeIndex === null)
        return
    dragNodeSiblings.splice(dragNodeIndex, 1)
    if (dropPosition === 'inside') {
        if (node.children) {
            node.children.unshift(dragNode)
        }
        else {
            node.children = [dragNode]
        }
        store.moveNoteTo(
            dragNode.rawNote as Note,
            node.rawNote as Note
        );
    }
    else if (dropPosition === 'before') {
        const [nodeSiblings, nodeIndex] = findSiblingsAndIndex(
            node,
            data.value
        )
        if (nodeSiblings === null || nodeIndex === null)
            return
        nodeSiblings.splice(nodeIndex, 0, dragNode)
        store.moveNoteBefore(
            dragNode.rawNote as Note,
            node.rawNote as Note
        );
    }
    else if (dropPosition === 'after') {
        const [nodeSiblings, nodeIndex] = findSiblingsAndIndex(
            node,
            data.value
        )
        if (nodeSiblings === null || nodeIndex === null)
            return
        nodeSiblings.splice(nodeIndex + 1, 0, dragNode)
        store.moveNoteAfter(
            dragNode.rawNote as Note,
            node.rawNote as Note
        );
    }
    data.value = Array.from(data.value)
}

function handleMenuSelect(option: TreeOption) {
    return (key: string) => {
        if (key === 'delete' && option.rawNote) {
            store.deleteNote(option.rawNote as Note)
        }
    }
}

function selectNote({ option }: { option: TreeOption }) {
    if (option.rawNote) {
        store.selectNote(option.rawNote as Note)
    }
}

// --- Tree rendering ---
function renderLabel({ option }: { option: TreeOption }) {
    return h(
        'div',
        {
            class: 'sidebar-label-row',
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                position: 'relative'
            }
        },
        [
            h('span', { class: 'truncate' }, typeof option.label === 'string' && option.label.length > 0 ? option.label : 'Untitled'),
            h(NDropdown, {
                options: getMenuOptions(option),
                trigger: 'click',
                onSelect: handleMenuSelect(option),
                placement: 'bottom-end',
                onClick: (e: MouseEvent) => e.stopPropagation()
            }, {
                default: () =>
                    h(
                        NButton,
                        {
                            class: 'sidebar-action-btn',
                            size: 'tiny',
                            quaternary: true,
                            style: 'margin-left: 8px;',
                            onClick: (e: MouseEvent) => e.stopPropagation()
                        },
                        { default: getNIcon(DotsHorizontal) }
                    )
            })
        ]
    )
}

function renderSwitcherIcon({ option }: { option: TreeOption }) {
    return h(NIcon, null, {
        default: () => {
            const rawNote = option.rawNote as Note;
            if (rawNote.children.length == 0)
                return h('span');
            return h(ChevronRight)
        }
    })
}

// --- Utility ---
function findSiblingsAndIndex(
    node: TreeOption,
    nodes?: TreeOption[]
): [TreeOption[], number] | [null, null] {
    if (!nodes)
        return [null, null]
    for (let i = 0; i < nodes.length; ++i) {
        const siblingNode = nodes[i]
        if (siblingNode.key === node.key)
            return [nodes, i]
        const [siblings, index] = findSiblingsAndIndex(node, siblingNode.children)
        if (siblings && index !== null)
            return [siblings, index]
    }
    return [null, null]
}

function toggleSearch() {
    showSearch.value = !showSearch.value
    pattern.value = ''
}
</script>

<style scoped>
.sidebar-container {
    display: flex;
    flex-direction: column;
    /* height: 100%; */
    height: auto;
}

.sidebar-tree-scroll {
    flex: 1 1 0%;
    min-height: 0;
    overflow-y: auto;
    max-height: 90vh;
}

::v-deep(.n-tree-node) {
    border: 1.5px solid transparent;
    border-radius: 0.375rem;
    transition: border-color 0.18s, box-shadow 0.18s;
    margin-left: 0.2rem;
    margin-right: 0.2rem;
}

::v-deep(.n-tree-node--selected) {
    background: #e3f2fd !important;
    border-color: #90caf9 1.5px solid transparent;
    box-shadow: 0 1px 4px 0 rgba(30, 136, 229, 0.07) !important;
}

::v-deep(.n-tree-node--selected .n-tree-node-switcher__icon) {
    color: #1976d2 !important;
}

::v-deep(.n-tree-node:hover) {
    background: #e3f2fd !important;
    box-shadow: 0 1px 4px 0 rgba(30, 136, 229, 0.07) !important;
}

::v-deep(.n-tree-node-content .sidebar-action-btn) {
    visibility: hidden;
}

::v-deep(.n-tree-node:hover .sidebar-action-btn) {
    visibility: visible;
}

::v-deep(.n-tree-node-content) {
    font-weight: 500;
    padding: 0.125rem 0.5rem;
}

::v-deep(.n-tree-node--selected .n-tree-node-content) {
    color: #1976d2;
}

::v-deep(.n-tree-node-indent > div) {
    width: 0.75rem !important;
}

::v-deep(.n-tree-node-switcher__icon) {
    color: black !important;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 0.25s, transform 0.25s;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
    opacity: 1;
    transform: translateY(0);
}

.sidebar-label-row {
    position: relative;
}

.sidebar-label-row .n-dropdown {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
}
</style>