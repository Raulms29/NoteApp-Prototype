import { app, BrowserWindow, powerMonitor, protocol, shell, ipcMain, session } from 'electron';
import electronSquirrelStartup from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electronSquirrelStartup) {
  console.log('electron-squirrel-startup');
  app.quit();
}

import path from 'path';
import fs from 'fs';
import contextMenu from "electron-context-menu";
import { registerNoteHandlers, registerFileHandlers } from './utils/ipc/fileHandler';
import { registerWorkspaceHandlers } from './utils/ipc/workspaceHandler';
import { registerWindowHandlers } from './utils/ipc/windowHandler';
import { registerSettingsHandlers } from './utils/ipc/settingsHandler';
import { registerExportHandlers } from './utils/ipc/exportHandler';

// Ensure only one instance of the app is running
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Focus the main window if a second instance is launched
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });


  // Define the main window
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

    mainWindow.setMinimumSize(800, 600);

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
    registerSettingsHandlers();
    registerExportHandlers();
    // Register window handlers and create the browser window
    registerWindowHandlers(createWindow());
    let workspaceRoot: string | null = null;

    ipcMain.handle('set-workspace-root', (_, rootPath: string) => {
      workspaceRoot = rootPath;
      console.log('Workspace root set to:', workspaceRoot);
    });

    // Register file protocol handler
    protocol.handle('mfp', async (request) => {
      if (!workspaceRoot) {
        return new Response('Workspace root not set', { status: 500 });
      }
      console.log('Handling file protocol request:', request.url);
      const url = new URL(request.url);
      console.log('Decoded URL pathname:', url.pathname);
      let filePath = decodeURIComponent(url.pathname);
      console.log('Relative path:', filePath);

      if (process.platform === 'win32' && filePath.startsWith('/')) {
        filePath = filePath.slice(1);
      }

      if (!fs.existsSync(filePath)) {
        return new Response('File not found', { status: 404 });
      }
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase().slice(1);

      const mimeTypes = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        webp: 'image/webp',
        pdf: 'application/pdf',
      };

      const mimeType: string = mimeTypes[ext as keyof typeof mimeTypes] || 'application/octet-stream';

      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': mimeType
        }
      });
    });

    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      if (
        details.url.includes('.files') &&
        !details.url.startsWith('mfp://') &&
        !details.url.startsWith('data:text/html')
      ) {
        // Extract the path starting from '/.files/' (including .files)
        const match = details.url.match(/(\/\.files\/[^?&#]*)/);
        const filePart = match ? match[1] : '';
        const redirectURL = `mfp:///${workspaceRoot.replace(/\\/g, '/')}${filePart}`;
        callback({ redirectURL });
      } else {
        callback({});
      }
    });
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
  // app.on('before-quit', () => {
  //   console.log('app before-quit');
  // });

  // app.on('browser-window-blur', () => {
  //   console.log('app browser-window-blur');
  // });

  // app.on('browser-window-focus', () => {
  //   console.log('app browser-window-focus');
  // });
}