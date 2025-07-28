<template>
    <div class="sidebar-settings-buttons">
        <button class="sidebar-btn m-1" title="Help">
            <HelpCircleOutline />
        </button>
        <button class="sidebar-btn m-1" title="Settings">
            <CogOutline />
        </button>

    </div>
</template>

<script lang="ts" setup>
import HelpCircleOutline from 'icons/HelpCircleOutline.vue';
import CogOutline from 'icons/CogOutline.vue';
</script>

<style scoped>
.sidebar-settings-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 0.5 rem;
}
</style>
