<template>
    <div class="relative inline-block text-left">
        <!-- Trigger -->
        <button @click="emit('update:open', !open)" class="inline-flex items-center px-3 py-2 bg-white bubble-button">
            <component :is="currentElementIcon" />
            <img src="../../assets/icons/chevronDown.svg" alt="Chevron Down" width="16" height="16" />
        </button>

        <!-- Dropdown Content -->
        <transition name="fade-scale">
            <div v-if="open" class="absolute z-10 mt-1 bg-white border rounded shadow-lg py-1 dropdown-container">
                <div class="px-1 flex-col justify-center ">
                    <p class="dropdown-header">Hierarchy</p>
                    <button :class="dropdownButtonClass" @click="toogleParagraph()">
                        <ParagraphIcon></ParagraphIcon>
                        Paragraph
                    </button>
                    <button :class="dropdownButtonClass" @click="tooggleHeading(1)">
                        <Header1Icon></Header1Icon>
                        Heading 1
                    </button>
                    <button :class="dropdownButtonClass" @click="tooggleHeading(2)">
                        <Header2Icon></Header2Icon>
                        Heading 2
                    </button>
                    <button :class="dropdownButtonClass" @click="tooggleHeading(3)">
                        <Header3Icon></Header3Icon>
                        Heading 3
                    </button>
                    <button :class="dropdownButtonClass" @click="tooggleHeading(4)">
                        <Header4Icon></Header4Icon>
                        Heading 4
                    </button>
                </div>
                <div class="p-0 flex-col justify-center">
                    <p class="dropdown-header">Lists</p>
                    <button :class="dropdownButtonClass" @click="toggleBulletList">
                        <BulletListIcon></BulletListIcon>
                        Bullet list
                    </button>
                    <button :class="dropdownButtonClass" @click="toggleOrderedList">
                        <OrderedListIcon></OrderedListIcon>
                        Ordered list
                    </button>
                    <button :class="dropdownButtonClass" @click="toggleTodoList">
                        <TodoListIcon></TodoListIcon>
                        Todo list
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { Editor } from '@tiptap/vue-3';
import Header1Icon from 'icons/FormatHeader1.vue';
import Header2Icon from 'icons/FormatHeader2.vue';
import Header3Icon from 'icons/FormatHeader3.vue';
import Header4Icon from 'icons/FormatHeader4.vue';

import BulletListIcon from 'icons/FormatListBulleted.vue';
import OrderedListIcon from 'icons/FormatListNumbered.vue';
import ParagraphIcon from 'icons/FormatParagraph.vue';
import TodoListIcon from 'icons/FormatListCheckbox.vue';
import { computed } from 'vue';

const isParagraph = computed(() => props.editor.isActive('paragraph'));
const isHeading1 = computed(() => props.editor.isActive('heading', { level: 1 }));
const isHeading2 = computed(() => props.editor.isActive('heading', { level: 2 }));
const isHeading3 = computed(() => props.editor.isActive('heading', { level: 3 }));
const isBulletList = computed(() => props.editor.isActive('bulletList'));
const isOrderedList = computed(() => props.editor.isActive('orderedList'));
const isTodoList = computed(() => props.editor.isActive('taskList'));

const currentElementIcon = computed(() => {
    if (isHeading1.value) return Header1Icon;
    if (isHeading2.value) return Header2Icon;
    if (isHeading3.value) return Header3Icon;
    if (isBulletList.value) return BulletListIcon;
    if (isOrderedList.value) return OrderedListIcon;
    if (isTodoList.value) return TodoListIcon;
    return ParagraphIcon;
});

const dropdownButtonClass = 'flex gap-1 dropdown-button';


// Props
const props = defineProps<{
    editor: Editor;
    open: boolean;
}>();

const emit = defineEmits(['update:open']);

// Toggle functions
function tooggleHeading(heading: any) {
    props.editor.chain().focus().toggleHeading({ level: heading }).run();
}

function toggleBulletList() {
    props.editor.chain().focus().toggleBulletList().run();
}

function toggleOrderedList() {
    props.editor.chain().focus().toggleOrderedList().run();
}

function toggleTodoList() {
    props.editor.chain().focus().toggleTaskList().run();
}

function toogleParagraph() {
    props.editor.chain().focus().setParagraph().run();
}


</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.fade-scale-enter-to,
.fade-scale-leave-from {
    opacity: 1;
    transform: scale(1);
}

.dropdown-header {
    font-size: 0.875rem;
    font-weight: 600;
    color: #4B5563;
    padding: 0.25rem 0.75rem;
}

.dropdown-button {
    display: flex;
    align-items: center;
    justify-content: left;
    padding: 6px;
    margin: 2px;
    background: none;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
    width: 100%;
    /* Ensures buttons take all available space */
}

.dropdown-button:hover {
    background: #f0f0f0;
}

.dropdown-button.is-active {
    background: #ededed;
}

.dropdown-container {
    white-space: nowrap;
}
</style>