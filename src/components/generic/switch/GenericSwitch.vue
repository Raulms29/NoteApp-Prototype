<template>
    <n-switch :rail-style="switchRailStyle" :value="modelValue" @update:value="onUpdate">
        <template #checked>
            <slot name="checked">{{ checkedText }}</slot>
        </template>
        <template #unchecked>
            <slot name="unchecked">{{ uncheckedText }}</slot>
        </template>
    </n-switch>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import switchRailStyle from './switchStyle';

const props = defineProps<{
    modelValue: boolean,
    checkedText?: string,
    uncheckedText?: string
}>();
const emit = defineEmits(['update:modelValue']);

const checkedText = computed(() => props.checkedText ?? 'Yes');
const uncheckedText = computed(() => props.uncheckedText ?? 'No');

function onUpdate(val: boolean) {
    emit('update:modelValue', val);
}
</script>