<template>
  <span
    v-bind="$attrs"
    :aria-hidden="title ? null : 'true'"
    :aria-label="title"
    class="material-design-icon dock-left-icon"
    role="img"
    @click="$emit('click', $event)"
  >
    <svg
      class="material-design-icon__svg"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      :stroke="fillColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <!-- Outer border (inset by 1px to account for stroke) -->
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />

      <!-- Left dock divider -->
      <line x1="9" y1="5" x2="9" y2="19" />

      <title v-if="title">{{ title }}</title>
    </svg>
  </span>
</template>

<script>
export default {
  name: "DockLeftNoFill",
  emits: ["click"],
  props: {
    title: {
      type: String,
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24,
    },
  },
};
</script>