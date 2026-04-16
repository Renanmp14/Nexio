const { app, BrowserWindow, ipcMain, session, nativeImage } = require('electron')
const path = require('path')

const isDev = !app.isPackaged

app.setName('Nexio')
app.name = 'Nexio'
process.title = 'Nexio'
app.setAppUserModelId('com.renanmp14.nexio')

function createBrandIcon() {
  // alterar icone / imagem: troque este SVG pela arte final do Nexio (ou carregue um arquivo .png/.ico/.icns via caminho local).
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#141e30"/><stop offset="100%" stop-color="#243b55"/></linearGradient></defs><rect x="72" y="72" width="880" height="880" rx="220" fill="url(#g)"/><path d="M268 744V280h118l258 301V280h112v464H646L380 433v311H268z" fill="#f5f7ff"/></svg>`
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  return nativeImage.createFromDataURL(dataUrl)
}

function applyRuntimeBranding() {
  app.setAboutPanelOptions({
    applicationName: 'Nexio',
    applicationVersion: app.getVersion(),
    version: app.getVersion()
  })

  const brandIcon = createBrandIcon()

  // In dev mode on macOS, Electron still uses the default binary icon unless we set Dock icon at runtime.
  if (process.platform === 'darwin' && app.dock) {
    if (!brandIcon.isEmpty()) {
      app.dock.setIcon(brandIcon)
    }
  }
}

function createWindow() {
  const brandIcon = createBrandIcon()

  const win = new BrowserWindow({
    title: 'Nexio',
    // alterar icone / imagem: aqui a janela usa o icone retornado por createBrandIcon().
    icon: brandIcon.isEmpty() ? undefined : brandIcon,
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      sandbox: false
    }
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Keep the app title stable so taskbar/dock does not revert to website titles.
  win.on('page-title-updated', (e) => {
    e.preventDefault()
  })
  win.on('ready-to-show', () => {
    win.setTitle('Nexio')
  })

  ipcMain.on('minimize-window', () => win.minimize())
  ipcMain.on('maximize-window', () => {
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  ipcMain.on('close-window', () => win.close())
}

app.whenReady().then(() => {
  applyRuntimeBranding()

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' *"]
      }
    })
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})