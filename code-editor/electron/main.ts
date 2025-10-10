import {app, BrowserWindow} from 'electron';
import * as path from 'path';
import {createAppMenu} from './menu';

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.resolve(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });
    const appRoot = app.getAppPath();
    const indexPath = path.join(appRoot, 'dist/public/index.html');
    win.loadFile(indexPath);
    createAppMenu(win);
}


process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

app.whenReady().then(createWindow);
