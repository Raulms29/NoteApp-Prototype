<template>
    <RouterView> </RouterView>
    <GenericDialog v-if="globalError" :title="'Error'"
        :text="`An unexpected error occurred: ${globalError}, please close the app and try again or contact support if the issue persists.`">
        <template #actions>
            <GenericButton variant="danger" @click="closeApp">Close App</GenericButton>
        </template>
    </GenericDialog>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import GenericDialog from '../components/generic/GenericDialog.vue';
import GenericButton from '../components/generic/GenericButton.vue';
import { useGlobalError } from '../stores/useGlobalError';
import { computed } from 'vue';
const errorStore = useGlobalError();
const globalError = computed(() => errorStore.globalError);

function closeApp() {
    window.close();
}
</script>

<style></style>