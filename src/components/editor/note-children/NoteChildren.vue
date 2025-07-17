<template>
    <NoteChildrenSmall v-if="notes.length > 5" :notes="notes" @select="$emit('select', $event)"
        @delete="$emit('delete', $event)" @create="$emit('create', $event)" />
    <NoteChildrenBig v-else :notes="notes" @select="$emit('select', $event)" @delete="$emit('delete', $event)"
        @create="$emit('create', $event)" />
</template>

<script lang="ts" setup>
import { Note } from '../../../services/domain/Note';
import NoteChildrenSmall from './NoteChildrenSmall.vue';
import NoteChildrenBig from './NoteChildrenBig.vue';
defineProps<{ notes: Note[] }>();
const emit = defineEmits(['select', 'delete', 'create']);
</script>
