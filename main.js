const { app, BrowserWindow, shell, nativeTheme, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// ── WhatsApp service ──
let waClient = null
let waStatus = 'disconnected' // disconnected | loading | qr | ready | error
let mainWin = null

function initWhatsApp () {
  try {
    const { Client, LocalAuth } = require('whatsapp-web.js')
    const QRCode = require('qrcode')

    waStatus = 'loading'
    mainWin && mainWin.webContents.send('wa-status', waStatus)

    waClient = new Client({
      authStrategy: new LocalAuth({
        dataPath: path.join(app.getPath('userData'), 'wa-auth')
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    })

    waClient.on('qr', async (qr) => {
      waStatus = 'qr'
      mainWin && mainWin.webContents.send('wa-status', waStatus)
      try {
        const dataUrl = await QRCode.toDataURL(qr, { width: 256 })
        mainWin && mainWin.webContents.send('wa-qr', dataUrl)
      } catch (_) {}
    })

    waClient.on('ready', () => {
      waStatus = 'ready'
      mainWin && mainWin.webContents.send('wa-status', waStatus)
    })

    waClient.on('auth_failure', () => {
      waStatus = 'error'
      mainWin && mainWin.webContents.send('wa-status', waStatus)
    })

    waClient.on('disconnected', () => {
      waStatus = 'disconnected'
      mainWin && mainWin.webContents.send('wa-status', waStatus)
      waClient = null
    })

    waClient.initialize()
  } catch (e) {
    waStatus = 'error'
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: '1012Sabores — Gestión',
    backgroundColor: '#F5F2EC',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
  win.setMenuBarVisibility(false)

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWin = win
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'light'
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ── WhatsApp IPC ──
ipcMain.handle('wa-init', () => {
  if (waStatus === 'disconnected' || waStatus === 'error') initWhatsApp()
  return waStatus
})

ipcMain.handle('wa-status', () => waStatus)

ipcMain.handle('wa-send', async (_event, { phone, message }) => {
  if (waStatus !== 'ready') return { ok: false, error: 'WhatsApp no conectado' }
  try {
    const number = phone.replace(/\D/g, '')
    const numberId = await waClient.getNumberId(number)
    if (!numberId) return { ok: false, error: 'Número no encontrado en WhatsApp. Verificá que sea un número activo.' }
    await waClient.sendMessage(numberId._serialized, message)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('wa-logout', async () => {
  try {
    if (waClient) await waClient.logout()
    waStatus = 'disconnected'
    waClient = null
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// ── Backup IPC ──
ipcMain.handle('get-backup-path', () => {
  return path.join(app.getPath('documents'), 'backups_1012sabores')
})

ipcMain.handle('save-backup', (_event, data) => {
  try {
    const dir = path.join(app.getPath('documents'), 'backups_1012sabores')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const date = new Date().toISOString().split('T')[0]
    const file = path.join(dir, `1012sabores_backup_${date}.json`)
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
    return { ok: true, path: file }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})
