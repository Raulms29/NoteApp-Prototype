import { NIcon } from "naive-ui";
import { h } from "vue";

export const getNIcon = (icon: unknown) => {
    return () => h(NIcon, null, { default: () => h(icon) });
};