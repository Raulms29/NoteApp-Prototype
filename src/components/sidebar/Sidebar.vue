<template>
    <n-tree block-line draggable :data="data" :render-label="renderLabel" :expanded-keys="expandedKeys"
        @drop="handleDrop" @update:expanded-keys="handleExpandedKeysChange"
        :override-default-node-click-behavior="selectNote" :render-switcher-icon="renderSwitcherIcon"
        style="--n-drop-mark-color: #1976d2;" />
</template>

<script lang="ts" setup>
import type { TreeDropInfo, TreeOption } from 'naive-ui'
import { NIcon } from 'naive-ui'
import { h, ref, watch } from 'vue'
import { useNotesStore } from '../../stores/useNotesStore'
import { Note } from '../../services/domain/Note'
import ChevronRight from 'icons/ChevronRight.vue'

const store = useNotesStore()

const expandedKeys = ref<string[]>([])
const data = ref<TreeOption[]>([])

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

// Watch for changes in the note tree and update data
watch(
    () => store.noteTree,
    (noteTree) => {
        data.value = (noteTree || []).map(noteToTreeOption)
    },
    { immediate: true, deep: true }
)

function handleExpandedKeysChange(keys: string[]) {
    expandedKeys.value = keys;
}

function handleDrop({ node, dragNode, dropPosition }: TreeDropInfo) {
    // Managing the drop of the elment
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
    // Update the view data
    data.value = Array.from(data.value)

}

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

function renderLabel({ option }: { option: TreeOption }) {
    return h(
        'div',
        { class: 'flex-1 truncate' },
        typeof option.label === 'string' && option.label.length > 0 ? option.label : 'Untitled'
    )
}

function selectNote({ option }: { option: TreeOption }) {
    if (option.rawNote) {
        store.selectNote(option.rawNote as Note)
    }
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
</script>

<style scoped>
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
</style>