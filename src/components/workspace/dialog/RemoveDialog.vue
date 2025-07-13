<template>
    <GenericDialog title="Delete Workspace" :text=getMessage()>
        <template #actions>
            <GenericButton variant="secondary" @click="$emit('cancel')">Cancel</GenericButton>
            <GenericButton variant="danger" @click="$emit('remove')">Delete</GenericButton>
        </template>
    </GenericDialog>
</template>

<script setup lang="ts">
import GenericDialog from '../../generic/GenericDialog.vue'
import GenericButton from '../../generic/GenericButton.vue'

const props = defineProps<{
    name: string
}>()

function getMessage(): string {
    return `Are you sure you want to delete the workspace "${props.name}"? This action cannot be undone.`
}

defineEmits<{
    (e: 'cancel'): void,
    (e: 'remove'): void
}>()
</script>