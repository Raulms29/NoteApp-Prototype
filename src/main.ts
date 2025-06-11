import { app, BrowserWindow, powerMonitor, shell } from 'electron';
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  console.log('electron-squirrel-startup');
  app.quit();
}

import path from 'path';
import contextMenu from "electron-context-menu";
import { registerNoteHandlers, registerFileHandlers } from './utils/ipc/fileHandler';
import { registerWorkspaceHandlers } from './utils/ipc/workspaceHandler';
import { registerWindowHandlers } from './utils/ipc/windowHandler';

const createWindow = () => {

  contextMenu({
    showInspectElement: false,
    showSearchWithGoogle: false,
  });

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    opacity: 1,
    center: true,
    resizable: true,
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    // have no visual flash (1)
    show: false,
  });

  mainWindow.webContents.session.setSpellCheckerLanguages(['en-US', 'es']);

  // Prevent opening links in the appplication itself
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: "deny" };
  });


  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // have no visual flash (2)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  powerMonitor.on('resume', () => {
    console.log('powerMonitor resume');
  });

  powerMonitor.on('suspend', () => {
    console.log('powerMonitor suspend');
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  console.log('App is ready');

  // Note file extension and encoding are registered here
  registerNoteHandlers(".html");
  registerWorkspaceHandlers();
  registerFileHandlers('utf-8');
  // Register window handlers and create the browser window
  registerWindowHandlers(createWindow());
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  console.log('app window-all-closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('app activate');
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ============================ //
// study
app.on('before-quit', () => {
  console.log('app before-quit');
});

app.on('browser-window-blur', () => {
  console.log('app browser-window-blur');
});

app.on('browser-window-focus', () => {
  console.log('app browser-window-focus');
});


