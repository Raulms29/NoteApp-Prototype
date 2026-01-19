export interface Settings {
    rememberLastWorkspace: boolean;
    rememberLastNote: boolean;
    focusMode: boolean;
    /**
     * Controls how sub-notes are displayed in the editor.
     * - 'DEFAULT': Show big sub-notes first, then change to small sub-notes.
     * - 'BIG_ONLY': Show only large sub-notes.
     * - 'SMALL_ONLY': Show only small sub-notes.
     * - 'NONE': Sub-notes are hidden in the editor.
     */
    subNotesDisplayType: 'DEFAULT' | 'BIG_ONLY' | 'SMALL_ONLY' | 'NONE';
    showFloatingMenu: boolean;
}
