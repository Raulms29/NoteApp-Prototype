<template>
    <div class="loading-overlay">
        <slot name="spinner">
            <Spinner />
        </slot>
        <slot />
    </div>
</template>

<script setup lang="ts">
import Spinner from './Spinner.vue'
</script>

<style scoped>
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    pointer-events: all;
}
</style>
