const { contextBridge, ipcRenderer } = require('electron/renderer')
contextBridge.exposeInMainWorld('globalConfig', {
	save: (data) => ipcRenderer.invoke('configSave', data),
	get: () => ipcRenderer.invoke('configGet'),
	getCon: () => ipcRenderer.invoke('conGet'),
	getMode: () => ipcRenderer.invoke('getMode'),
})
