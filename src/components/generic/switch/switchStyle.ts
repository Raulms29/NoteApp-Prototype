import { CSSProperties } from "vue";

const switchRailStyle = ({
    focused,
    checked
}: {
    focused: boolean
    checked: boolean
}) => {
    const style: CSSProperties = {};
    if (checked) {
        style.background = 'var(--main-detail-color)';
        if (focused) {
            style.boxShadow = '0 0 0 2px var(--main-detail-color-transparent)';
        }
    } else {
        style.background = '';
        if (focused) {
            style.boxShadow = '0 0 0 2px var(--main-detail-color-transparent)';
        }
    }
    return style;
};

export default switchRailStyle;