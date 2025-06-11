<template>
    <GenericDialog title="Rename Workspace" text="Write the new name for the workspace">
        <template #content>
            <input v-model="localName" type="text" class="generic-dialog-input" placeholder="New workspace name" />
        </template>
        <template #actions>
            <GenericButton variant="secondary" @click="$emit('cancel')">Cancel</GenericButton>
            <GenericButton variant="primary" @click="$emit('rename', localName)">Rename</GenericButton>
        </template>
    </GenericDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GenericDialog from '../../GenericDialog.vue'
import GenericButton from '../../GenericButton.vue'

const props = defineProps<{
    name: string
}>()

defineEmits<{
    (e: 'cancel'): void,
    (e: 'rename', newName: string): void
}>()

const localName = ref(props.name)
</script>

<style scoped></style>
