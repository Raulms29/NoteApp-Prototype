import { NIcon } from "naive-ui";
import { h } from "vue";

/**
 * Wraps a given icon component for use with Naive UI's NIcon.
 * @param icon - The icon component to render.
 * @returns A render function for the NIcon component.
 */
export const getNIcon = (icon: unknown) => {
    return () => h(NIcon, null, { default: () => h(icon) });
};