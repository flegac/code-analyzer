const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('api', {
    onFileOpened: (callback: (content: string) => void) => {
        ipcRenderer.on('file-opened', (_: unknown, content: string) => callback(content));
    },
    onRequestSave: (callback: () => void) => {
        ipcRenderer.on('request-save', () => callback());
    },
    saveFile: (content: string) => ipcRenderer.invoke('save-file', content),
});