import { app, Menu, shell } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';

export function createAppMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // macOS App menu
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),

    // File Menu
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    // Edit Menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },

    // View Menu
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' }
      ]
    },

    // Window (defaults)
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },

    // Help Menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'Open Help',
          click: async () => {
            await shell.openExternal('https://github.com/Raulms29/Slate-Note-App/blob/master/docs/USER_MANUAL.md');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template as unknown as MenuItemConstructorOptions[]);
  Menu.setApplicationMenu(menu);
}