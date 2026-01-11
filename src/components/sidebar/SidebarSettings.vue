<template>
    <div class="sidebar-settings-buttons">
        <button class="sidebar-btn m-1" title="Help" @click="showHelp">
            <HelpCircleOutline />
        </button>
        <button class="sidebar-btn m-1" title="Settings" @click="showSettings = true">
            <CogOutline />
        </button>


        <Settings v-if="showSettings" @close="showSettings = false">

        </Settings>
    </div>
</template>

<script lang="ts" setup>
import HelpCircleOutline from 'icons/HelpCircleOutline.vue';
import CogOutline from 'icons/CogOutline.vue';
import { ref } from 'vue';

const showSettings = ref(false);

function showHelp() {
    window.open("https://example.com", '_blank');
}
</script>

<style scoped>
.sidebar-settings-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: fit-content;
}
</style>
