<template>
    <NoteChildrenSmall
        v-if="(notes.length > settingsStore.numberSubnotesBigDefault && settingsStore.settings.subNotesDisplayType === 'DEFAULT') || settingsStore.settings.subNotesDisplayType === 'SMALL_ONLY'"
        :notes="notes" @select="$emit('select', $event)" @delete="$emit('delete', $event)"
        @create="$emit('create', $event)" />
    <NoteChildrenBig
        v-else-if="settingsStore.settings.subNotesDisplayType === 'BIG_ONLY' || (notes.length <= settingsStore.numberSubnotesBigDefault && settingsStore.settings.subNotesDisplayType === 'DEFAULT')"
        :notes="notes" @select="$emit('select', $event)" @delete="$emit('delete', $event)"
        @create="$emit('create', $event)" />
</template>

<script lang="ts" setup>
import { Note } from '../../../business/domain/Note';
import NoteChildrenSmall from './NoteChildrenSmall.vue';
import NoteChildrenBig from './NoteChildrenBig.vue';
import { useSettingsStore } from '../../../stores/useSettingsStore';
defineProps<{ notes: Note[] }>();
const emit = defineEmits(['select', 'delete', 'create']);
const settingsStore = useSettingsStore();
</script>
