<template>
    <div class="relative inline-block text-left">
        <!-- Trigger -->
        <button @click="emit('update:open', !open)" class="inline-flex items-center px-3 py-2 bg-white bubble-button">
            <LinkIcon title="Link"></LinkIcon>
        </button>

        <!-- Dropdown Content -->
        <transition name="fade-scale">
            <div v-if="open" class="absolute z-10 mt-1 bg-white border rounded shadow-lg py-1 dropdown-container">
                <!-- Form -->
                <form class="flex items-center gap-2 pr-1 pl-1">
                    <label for="link-input"
                        class="flex items-center gap-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 cursor-text">
                        <span class="sr-only">URL</span>
                        <input id="link-input" name="link-input"
                            class="flex-1 bg-transparent outline-none min-w-[12rem] text-black text-sm dark:text-white"
                            placeholder="Enter URL" type="url" v-model="url" />
                    </label>
                    <button :disabled="!isUrlValid" @click.prevent="setLink"
                        class="flex group items-center justify-center border gap-2 text-sm font-semibold rounded-md disabled:opacity-50 whitespace-nowrap text-white bg-black border-black dark:text-black dark:bg-white dark:border-white py-1 px-2"
                        type="submit">
                        Set Link
                    </button>
                </form>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { Editor } from '@tiptap/vue-3';
import LinkIcon from 'icons/Link.vue';
import { isAllowedUri } from '../../../utils/urlUtils';
import { ref, computed } from 'vue';

// Props
const props = defineProps<{
    editor: Editor;
    open: boolean;
}>();

const emit = defineEmits(['update:open']);

const url = ref('');

const isUrlValid = computed(() => isAllowedUri(url.value));

function setLink() {
    if (isUrlValid.value) {
        // Logic to set the link in the editor
        props.editor.chain().focus().setLink({ href: url.value }).run();
        // Clear the URL input after setting the link
        url.value = '';
        // Close the dropdown after setting the link
        emit('update:open', false);
    }
}
</script>