const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  getBrowserDataSummary: () => ipcRenderer.invoke('browser-data:get-summary'),
  clearBrowserData: (options) => ipcRenderer.invoke('browser-data:clear', options),
  trackVisitedSite: (url) => ipcRenderer.invoke('browser-data:track-site', url),
  getBrowserDataCatalog: () => ipcRenderer.invoke('browser-data:get-catalog'),
  deleteBrowserDataItem: (payload) => ipcRenderer.invoke('browser-data:delete-item', payload),
  deleteBrowserDataGroup: (payload) => ipcRenderer.invoke('browser-data:delete-group', payload),
  deleteAllBrowserDataGroups: () => ipcRenderer.invoke('browser-data:delete-all-groups')
})