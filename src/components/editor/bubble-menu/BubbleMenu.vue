<template>
    <bubble-menu :editor="editor" :tippy-options="{ duration: 300, maxWidth: 800, appendTo: 'parent' }" v-if="editor"
        class="bubble-menu gap-0">

        <!-- Dropdown for selecting headings and lists -->
        <ElementDropdown :editor="editor" :open="open" @update:open="handleDropdownOpenChange" ref="elementDropdown">
        </ElementDropdown>
        <div class="separator"></div>
        <div class="button-group">
            <!-- Bold -->
            <button :class="{ 'is-active': editor.isActive('bold') }" class="bubble-button" @click="toggleBold()">
                <BoldIcon title="Bold"></BoldIcon>
            </button>
            <!-- Italic -->
            <button :class="{ 'is-active': editor.isActive('italic') }" class="bubble-button" @click="toggleItalic()">
                <ItalicIcon title="Italic"></ItalicIcon>
            </button>
            <!-- Underline -->
            <button :class="{ 'is-active': editor.isActive('underline') }" class="bubble-button"
                @click="toggleUnderline()">
                <UnderLineIcon title="Underline"></UnderLineIcon>
            </button>
            <!-- Highlight -->
            <button :class="{ 'is-active': editor.isActive('highlight') }" class="bubble-button"
                @click="toggleHighlight()">
                <MarkerIcon title="Highlight"></MarkerIcon>
            </button>
            <!-- Strike -->
            <button :class="{ 'is-active': editor.isActive('strike') }" class="bubble-button" @click="toggleStrike()">
                <StrikeIcon title="Strike"></StrikeIcon>
            </button>
            <!-- Code Block -->
            <button :class="{ 'is-active': editor.isActive('codeBlock') }" class="bubble-button"
                @click="toggleCodeBlock()">
                <CodeIcon title="Code Block"></CodeIcon>
            </button>
            <!-- Add Image Button -->
            <button class="bubble-button" @click="triggerImageInput">
                <ImageIcon title="Image"></ImageIcon>
                <input ref="imageInput" type="file" accept="image/*" style="display:none" @change="handleImageUpload" />
            </button>
            <!-- Add PDF Button -->
            <button class="bubble-button" @click="triggerPdfInput">
                <PDFIcon title="PDF"></PDFIcon>
                <input ref="pdfInput" type="file" accept=".pdf" style="display:none" @change="handlePdfUpload" />
            </button>
            <!-- Link -->
            <AddLinkDialog :editor="editor" :open="linkDialogOpen" @update:open="handleLinkDialogOpenChange"
                ref="linkDialog">
            </AddLinkDialog>
        </div>

    </bubble-menu>
</template>

<script setup lang="ts">
import { Editor, BubbleMenu } from '@tiptap/vue-3';
import { onBeforeUnmount, onMounted, Ref, ref } from 'vue';
import BoldIcon from 'icons/FormatBold.vue';
import ItalicIcon from 'icons/FormatItalic.vue';
import UnderLineIcon from 'icons/FormatUnderline.vue';
import StrikeIcon from 'icons/FormatStrikethrough.vue';
import CodeIcon from 'icons/CodeTags.vue';
import ImageIcon from 'icons/ImageOutline.vue';
import PDFIcon from 'icons/FilePdfBox.vue';
import MarkerIcon from 'icons/Marker.vue';

const emit = defineEmits(['image-upload', 'pdf-upload']);

const elementDropdown = ref(null)

const props = defineProps({
    editor: Editor,
});


function toggleItalic() {
    props.editor.chain().focus().toggleItalic().run();
}
function toggleBold() {
    props.editor.chain().focus().toggleBold().run();
}
function toggleStrike() {
    props.editor.chain().focus().toggleStrike().run();
}
function toggleUnderline() {
    props.editor.chain().focus().toggleUnderline().run();
}
function toggleCodeBlock() {
    props.editor.chain().focus().toggleCodeBlock().run();
}
function toggleHighlight() {
    props.editor.chain().focus().toggleHighlight().run();
}

const open: Ref<boolean> = ref(false);
const linkDialogOpen = ref(false);
const linkDialog = ref(null);

const imageInput = ref<HTMLInputElement | null>(null);
const pdfInput = ref<HTMLInputElement | null>(null);

const handleDropdownOpenChange = (newValue: boolean) => {
    open.value = newValue;
};

function handleClickOutside(event: MouseEvent, refElement: Ref<HTMLElement | { $el: HTMLElement } | null>, state: Ref<boolean>) {
    const elementValue = refElement.value instanceof HTMLElement ? refElement.value : refElement.value?.$el; // Handle both DOM and component refs
    if (elementValue && !elementValue.contains(event.target as Node)) {
        state.value = false; // Close the dropdown/dialog if clicked outside
    }
}

onMounted(() => {
    document.addEventListener('click', (event) => handleClickOutside(event, elementDropdown, open));
    document.addEventListener('click', (event) => handleClickOutside(event, linkDialog, linkDialogOpen));
});

onBeforeUnmount(() => {
    document.removeEventListener('click', (event) => handleClickOutside(event, elementDropdown, open));
    document.removeEventListener('click', (event) => handleClickOutside(event, linkDialog, linkDialogOpen));
});

function triggerImageInput() {
    imageInput.value?.click();
}

function handleImageUpload(event: Event) {
    emitFileUpload(event, 'image');
}

function triggerPdfInput() {
    pdfInput.value?.click();
}

function handlePdfUpload(event: Event) {
    emitFileUpload(event, 'pdf');
}

function emitFileUpload(event: Event, type: 'image' | 'pdf') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    console.log('Selected file:', file);
    if (type === 'image') {
        emit('image-upload', file.path);
    } else if (type === 'pdf') {
        emit('pdf-upload', file.path);
    }
    input.value = '';
}

const handleLinkDialogOpenChange = (newValue: boolean) => {
    linkDialogOpen.value = newValue;
};
</script>

<style>
.bubble-menu {
    display: flex;
    align-items: center;
    gap: 2px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(6px);
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 6px 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    font-family: 'Inter', sans-serif;
}

.button-group {
    display: flex;
    gap: 1px;
}

.bubble-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    background: none;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}

.bubble-button:hover {
    background: #f0f0f0;
}

.bubble-button.is-active {
    background: #ededed;
}



.bubble-button:focus-visible {
    outline: 2px solid #6200ee;
    outline-offset: 2px;
}

.separator {
    width: 1px;
    height: 24px;
    background-color: #e0e0e0;
}

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

.dropdown-container {
    white-space: nowrap;
}
</style>