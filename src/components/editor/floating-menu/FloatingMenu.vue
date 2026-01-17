<template>
    <floating-menu :editor="editor" v-if="editor" class="floating-menu">
        <div class="button-group">
            <!-- Heading 1 -->
            <button :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }" class="floating-button"
                @click="toggleHeading(1)">
                <Header1Icon />
            </button>
            <!-- Heading 2 -->
            <button :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }" class="floating-button"
                @click="toggleHeading(2)">
                <Header2Icon />
            </button>
            <!-- Bullet list -->
            <button :class="{ 'is-active': editor.isActive('bulletList') }" class="floating-button"
                @click="toggleBulletList">
                <BulletListIcon />
            </button>
            <!-- Ordered list -->
            <button :class="{ 'is-active': editor.isActive('orderedList') }" class="floating-button"
                @click="toggleOrderedList">
                <OrderedListIcon />
            </button>

            <div class="separator"></div>

            <!-- Bold -->
            <button :class="{ 'is-active': editor.isActive('bold') }" class="floating-button" @click="toggleBold()">
                <BoldIcon title="Bold"></BoldIcon>
            </button>
            <!-- Italic -->
            <button :class="{ 'is-active': editor.isActive('italic') }" class="floating-button" @click="toggleItalic()">
                <ItalicIcon title="Italic"></ItalicIcon>
            </button>
            <!-- Code block -->
            <button :class="{ 'is-active': editor.isActive('codeBlock') }" class="floating-button"
                @click="toggleCodeBlock()">
                <CodeIcon title="Code Block"></CodeIcon>
            </button>

            <div class="separator"></div>

            <!-- Add Image Button -->
            <button class="floating-button" @click="triggerImageInput">
                <ImageIcon title="Image"></ImageIcon>
                <input ref="imageInput" type="file" accept="image/*" style="display:none" @change="handleImageUpload" />
            </button>

            <!-- Add PDF Button -->
            <button class="floating-button" @click="triggerPdfInput">
                <PDFIcon title="PDF"></PDFIcon>
                <input ref="pdfInput" type="file" accept=".pdf" style="display:none" @change="handlePdfUpload" />
            </button>
        </div>

    </floating-menu>
</template>

<script setup lang="ts">
import { Editor, FloatingMenu } from '@tiptap/vue-3';
import { ref } from 'vue';
import BoldIcon from 'icons/FormatBold.vue';
import ItalicIcon from 'icons/FormatItalic.vue';
import Header1Icon from 'icons/FormatHeader1.vue';
import Header2Icon from 'icons/FormatHeader2.vue';
import BulletListIcon from 'icons/FormatListBulleted.vue';
import OrderedListIcon from 'icons/FormatListNumbered.vue';
import CodeIcon from 'icons/CodeTags.vue';
import ImageIcon from 'icons/ImageOutline.vue';
import PDFIcon from 'icons/FilePdfBox.vue';

const emit = defineEmits(['image-upload', 'pdf-upload']);

const props = defineProps({
    editor: Editor,
});

const imageInput = ref<HTMLInputElement | null>(null);
const pdfInput = ref<HTMLInputElement | null>(null);

function toggleHeading(heading: any) {
    props.editor.chain().focus().toggleHeading({ level: heading }).run();
}

function toggleBulletList() {
    props.editor.chain().focus().toggleBulletList().run();
}

function toggleOrderedList() {
    props.editor.chain().focus().toggleOrderedList().run();
}

function toggleCodeBlock() {
    props.editor.chain().focus().toggleCodeBlock().run();
}

function toggleBold() {
    props.editor.chain().focus().toggleBold().run();
}

function toggleItalic() {
    props.editor.chain().focus().toggleItalic().run();
}

function triggerImageInput() {
    imageInput.value?.click();
}

function triggerPdfInput() {
    pdfInput.value?.click();
}

function handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    emit('image-upload', file.path);
    input.value = '';
}

function handlePdfUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    emit('pdf-upload', file.path);
    input.value = '';
}

</script>

<style>
.floating-menu {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid #e9e9e9;
    border-radius: 6px;
    padding: 4px 6px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
    font-family: 'Inter', sans-serif;
    font-size: 13px;
}

.button-group {
    display: flex;
    gap: 6px;
}

.floating-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    background: none;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.floating-button svg {
    width: 16px;
    height: 16px;
}

.floating-button:hover {
    background: #f7f7f7;
}

.floating-button.is-active {
    background: #f0f0f0;
}

.separator {
    width: 1px;
    height: 20px;
    background-color: #e6e6e6;
}
</style>
