const { app, BrowserWindow, ipcMain, session, nativeImage } = require('electron')
const fs = require('fs')
const path = require('path')

const isDev = !app.isPackaged

app.setName('Nexio')
app.name = 'Nexio'
process.title = 'Nexio'
app.setAppUserModelId('com.renanmp14.nexio')

const VISITED_SITES_FILE = 'visited-sites.json'

function getVisitedSitesFilePath() {
  return path.join(app.getPath('userData'), VISITED_SITES_FILE)
}

function readVisitedSites() {
  try {
    const filePath = getVisitedSitesFilePath()
    if (!fs.existsSync(filePath)) return []
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeVisitedSites(sites) {
  const filePath = getVisitedSitesFilePath()
  fs.writeFileSync(filePath, JSON.stringify(sites, null, 2), 'utf-8')
}

function buildCookieId(cookie) {
  return `${cookie.name}|${cookie.domain}|${cookie.path}`
}

function buildCookieUrl(cookie) {
  const host = (cookie.domain || '').replace(/^\./, '')
  const protocol = cookie.secure ? 'https' : 'http'
  const pathname = cookie.path || '/'
  return `${protocol}://${host}${pathname}`
}

function isLoginCookie(cookieName = '') {
  return /(session|auth|token|sid|login|jwt|remember|user)/i.test(cookieName)
}

async function getBrowserDataCatalog() {
  const cookies = await session.defaultSession.cookies.get({})
  const visitedSites = readVisitedSites()

  const cookiesList = cookies.map((cookie) => ({
    id: buildCookieId(cookie),
    name: cookie.name,
    domain: cookie.domain,
    path: cookie.path,
    secure: cookie.secure,
    session: cookie.session
  }))

  const loginCookies = cookiesList.filter((cookie) => isLoginCookie(cookie.name))

  const cacheOrigins = Array.from(
    new Set(
      visitedSites
        .map((site) => site.origin)
        .filter(Boolean)
    )
  ).map((origin) => ({ id: origin, origin }))

  return {
    sites: visitedSites,
    logins: loginCookies,
    cookies: cookiesList,
    cache: cacheOrigins
  }
}

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

ipcMain.handle('browser-data:get-summary', async () => {
  const cookies = await session.defaultSession.cookies.get({})
  return {
    cookies: cookies.length,
    localStorage: 'Salvo por site (origens visitadas)',
    cache: 'Cache HTTP e cache de recursos'
  }
})

ipcMain.handle('browser-data:clear', async (_event, options = {}) => {
  const clearCookies = Boolean(options.cookies)
  const clearLocalStorage = Boolean(options.localStorage)
  const clearCache = Boolean(options.cache)

  const storages = []
  if (clearCookies) storages.push('cookies')
  if (clearLocalStorage) storages.push('localstorage')
  if (clearCache) storages.push('cachestorage')

  if (storages.length > 0) {
    await session.defaultSession.clearStorageData({ storages })
  }

  if (clearCache) {
    await session.defaultSession.clearCache()
  }

  const cookies = await session.defaultSession.cookies.get({})
  return {
    success: true,
    remainingCookies: cookies.length
  }
})

app.whenReady().then(() => {
  applyRuntimeBranding()

  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(true)
  })

  session.defaultSession.setPermissionCheckHandler(() => true)

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' * blob: data: mediastream:"]
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

ipcMain.handle('browser-data:track-site', async (_event, url) => {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return { success: true }

    const origin = parsed.origin
    const now = new Date().toISOString()
    const sites = readVisitedSites()
    const existingIndex = sites.findIndex((site) => site.origin === origin)

    if (existingIndex >= 0) {
      sites[existingIndex] = { ...sites[existingIndex], lastVisitedAt: now }
    } else {
      sites.unshift({
        id: origin,
        origin,
        lastVisitedAt: now
      })
    }

    const trimmed = sites
      .sort((a, b) => new Date(b.lastVisitedAt) - new Date(a.lastVisitedAt))
      .slice(0, 500)

    writeVisitedSites(trimmed)
    return { success: true }
  } catch {
    return { success: false }
  }
})

ipcMain.handle('browser-data:get-catalog', async () => {
  return getBrowserDataCatalog()
})

ipcMain.handle('browser-data:delete-item', async (_event, payload = {}) => {
  const { category, id } = payload

  if (!category || !id) {
    return { success: false, message: 'Payload invalido' }
  }

  if (category === 'sites') {
    const sites = readVisitedSites().filter((site) => site.id !== id)
    writeVisitedSites(sites)
    return { success: true, catalog: await getBrowserDataCatalog() }
  }

  if (category === 'cache') {
    await session.defaultSession.clearStorageData({
      origin: id,
      storages: ['cachestorage']
    })
    return { success: true, catalog: await getBrowserDataCatalog() }
  }

  if (category === 'cookies' || category === 'logins') {
    const cookies = await session.defaultSession.cookies.get({})
    const target = cookies.find((cookie) => buildCookieId(cookie) === id)
    if (target) {
      await session.defaultSession.cookies.remove(buildCookieUrl(target), target.name)
    }
    return { success: true, catalog: await getBrowserDataCatalog() }
  }

  return { success: false, message: 'Categoria nao suportada' }
})

ipcMain.handle('browser-data:delete-group', async (_event, payload = {}) => {
  const { category } = payload

  if (!category) {
    return { success: false, message: 'Categoria invalida' }
  }

  if (category === 'sites') {
    writeVisitedSites([])
    return { success: true, catalog: await getBrowserDataCatalog() }
  }

  if (category === 'logins') {
    const cookies = await session.defaultSession.cookies.get({})
    const loginCookies = cookies.filter((cookie) => isLoginCookie(cookie.name))

    for (const cookie of loginCookies) {
      await session.defaultSession.cookies.remove(buildCookieUrl(cookie), cookie.name)
    }

    return { success: true, catalog: await getBrowserDataCatalog() }
  }

  if (category === 'cookies') {
    await session.defaultSession.clearStorageData({ storages: ['cookies'] })
    return { success: true, catalog: await getBrowserDataCatalog() }
  }

  if (category === 'cache') {
    await session.defaultSession.clearStorageData({ storages: ['cachestorage'] })
    await session.defaultSession.clearCache()
    return { success: true, catalog: await getBrowserDataCatalog() }
  }

  return { success: false, message: 'Categoria nao suportada' }
})

ipcMain.handle('browser-data:delete-all-groups', async () => {
  writeVisitedSites([])

  await session.defaultSession.clearStorageData({
    storages: ['cookies', 'localstorage', 'cachestorage']
  })
  await session.defaultSession.clearCache()

  return { success: true, catalog: await getBrowserDataCatalog() }
})