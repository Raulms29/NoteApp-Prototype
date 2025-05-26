<template>
    <bubble-menu :editor="editor" :tippy-options="{ duration: 300 }" v-if="editor" class="bubble-menu">

        <!-- Dropdown for selecting headings and lists -->
        <Dropdown :editor="editor" :open="open" @update:open="handleOpenChange" ref="dropdown">
        </Dropdown>
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
            <!-- Strike -->
            <button :class="{ 'is-active': editor.isActive('strike') }" class="bubble-button" @click="toggleStrike()">
                <StrikeIcon title="Strike"></StrikeIcon>
            </button>
            <!-- Code Block -->
            <button :class="{ 'is-active': editor.isActive('codeBlock') }" class="bubble-button"
                @click="toggleCodeBlock()">
                <CodeIcon title="Code Block"></CodeIcon>
            </button>
        </div>
    </bubble-menu>
</template>

<script setup lang="ts">
import { BubbleMenu } from '@tiptap/vue-3';
import { onBeforeUnmount, onMounted, Ref, ref } from 'vue';
import { Editor } from '@tiptap/vue-3';
import BoldIcon from 'icons/FormatBold.vue';
import ItalicIcon from 'icons/FormatItalic.vue';
import UnderLineIcon from 'icons/FormatUnderline.vue';
import StrikeIcon from 'icons/FormatStrikethrough.vue';
import CodeIcon from 'icons/CodeTags.vue';

const dropdown = ref(null)

function handleClickOutside(event: MouseEvent) {
    const dropdownElement = dropdown.value?.$el || dropdown.value; // Handle both DOM and component refs
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
        open.value = false; // Close the dropdown if clicked outside
    }
}


const props = defineProps({
    editor: Editor,
});

const open: Ref<boolean> = ref(false);

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

const handleOpenChange = (newValue: boolean) => {
    open.value = newValue;
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style>
.bubble-menu {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
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

.bubble-menu {
    backdrop-filter: blur(6px);
    background: rgba(255, 255, 255, 0.9);
}

.bubble-button:focus-visible {
    outline: 2px solid #6200ee;
    outline-offset: 2px;
}

.separator {
    width: 1px;
    height: 24px;
    background-color: #e0e0e0;
    /* margin: 0 8px; */
}
</style>