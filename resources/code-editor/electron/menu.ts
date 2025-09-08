import {BrowserWindow, dialog, ipcMain, Menu, MenuItem} from 'electron';
import * as fs from 'fs';

export function createAppMenu(win: BrowserWindow) {
    const menu = Menu.getApplicationMenu();
    if (!menu) return;

    const fileMenu = menu.items.find(item => item.label === 'File');
    if (!fileMenu) return;


    fileMenu.submenu?.append(new MenuItem({
        label: 'Open...',
        accelerator: 'CmdOrCtrl+O',
        click: async () => {
            const result = await dialog.showOpenDialog(win, {
                properties: ['openFile'],
                // filters: [{name: 'Text Files', extensions: ['txt', 'js', 'json']}]
            });

            if (!result.canceled && result.filePaths.length > 0) {
                const content = fs.readFileSync(result.filePaths[0], 'utf8');
                win.webContents.send('file-opened', content);
            }
        }
    }));

    fileMenu.submenu?.append(new MenuItem({
        label: 'Save...',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
            win.webContents.send('request-save');
        }
    }));
    // Menu.setApplicationMenu(menu);


    ipcMain.handle('save-file', async (_event: unknown, content: string) => {
        const result = await dialog.showSaveDialog({
            title: 'Save File',
            defaultPath: 'untitled.txt',
            filters: [{name: 'Text Files', extensions: ['txt', 'js', 'json']}]
        });

        if (!result.canceled && result.filePath) {
            fs.writeFileSync(result.filePath, content, 'utf8');
        }
    });

}
