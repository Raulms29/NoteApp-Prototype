import { ipcMain, BrowserWindow } from 'electron';

export function registerWindowHandlers(mainWindow: BrowserWindow | null, defaultWidth: number, defaultHeight: number) {
    ipcMain.handle('set-resizable', (_event, resizable: boolean) => {
        if (mainWindow) mainWindow.setResizable(resizable);
    });
    ipcMain.handle('maximize-window', () => {
        if (mainWindow) mainWindow.maximize();
    });
    ipcMain.handle('unmaximize-window', () => {
        if (mainWindow) mainWindow.unmaximize();
    });
    ipcMain.handle('minimize-window', () => {
        if (mainWindow) mainWindow.minimize();
    });
    ipcMain.handle('change-window-size', (_, height = defaultHeight, width = defaultWidth) => {
        if (mainWindow) mainWindow.setSize(width, height, true);
    });
    ipcMain.handle('is-maximized', () => {
        if (mainWindow) return mainWindow.isMaximized();
        return false;
    });
}