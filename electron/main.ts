import { app, BrowserWindow, shell, ipcMain, Notification } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

// ─── Auto-updater ───
let autoUpdater: any = null;
if (!isDev) {
  try {
    autoUpdater = require('electron-updater').autoUpdater;
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
  } catch {}
}

function setupAutoUpdater() {
  if (!autoUpdater) return;

  autoUpdater.on('update-available', (info: any) => {
    if (Notification.isSupported()) {
      new Notification({
        title: 'تحديث متاح',
        body: 'جاري تحميل التحديث الجديد تلقائياً...',
      }).show();
    }
    mainWindow?.webContents.send('update-status', { type: 'available', info });
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('update-status', { type: 'not-available' });
  });

  autoUpdater.on('download-progress', (progress: any) => {
    mainWindow?.webContents.send('update-status', {
      type: 'progress',
      percent: Math.round(progress.percent || 0),
    });
  });

  autoUpdater.on('update-downloaded', (info: any) => {
    if (Notification.isSupported()) {
      new Notification({
        title: 'تم تحميل التحديث',
        body: 'سيتم تثبيته عند إغلاق التطبيق.',
      }).show();
    }
    mainWindow?.webContents.send('update-status', { type: 'downloaded', info });
  });

  autoUpdater.on('error', (err: any) => {
    mainWindow?.webContents.send('update-status', { type: 'error', message: String(err?.message || err) });
  });

  // Check for updates after 10 seconds, then every 1 hour
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 10000);
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 60 * 60 * 1000);

  // IPC: allow renderer to trigger install
  ipcMain.handle('install-update', () => {
    if (autoUpdater) {
      autoUpdater.quitAndInstall();
    }
  });
}

const ALLOWED_HASH_PREFIXES = [
  '/business',
  '/login',
  '/signup',
];

function isAllowedHash(hash: string): boolean {
  const h = String(hash || '').replace(/^#/, '');
  return ALLOWED_HASH_PREFIXES.some((p) => h === p || h.startsWith(p + '/') || h.startsWith(p));
}

function getFrontendEntry(): string {
  const distPath = path.join(__dirname, '..', 'apps', 'dashboard', 'dist', 'index.html');
  if (fs.existsSync(distPath)) return distPath;
  return '';
}

function getLoadUrl(): string {
  const entry = getFrontendEntry();
  if (entry) return `file://${entry}#/business`;
  return 'http://localhost:3010/#/business';
}

function createWindow() {
  const entry = getFrontendEntry();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: 'نمّي أعمالك — لوحة التاجر',
    backgroundColor: '#0f172a',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev && !entry) {
    mainWindow.loadURL('http://localhost:5174/#/business');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else if (entry) {
    mainWindow.loadFile(entry, { hash: '/business' });
  } else {
    mainWindow.loadURL('http://localhost:5174/#/business');
  }

  // Block navigation to non-business routes (full page nav)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    try {
      const u = new URL(url);
      const hash = u.hash || '';
      if (!isAllowedHash(hash)) {
        event.preventDefault();
        mainWindow?.loadURL(getLoadUrl());
      }
    } catch {
      event.preventDefault();
    }
  });

  // Intercept in-page hash changes to prevent leaving business routes
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.executeJavaScript(`
      (function() {
        window.addEventListener('hashchange', function() {
          var h = window.location.hash || '';
          var allowed = ['/business', '/login', '/signup'];
          var ok = allowed.some(function(p) {
            var clean = h.replace(/^#/, '');
            return clean === p || clean.indexOf(p + '/') === 0 || clean.indexOf(p) === 0;
          });
          if (!ok) {
            window.location.hash = '/business';
          }
        }, false);
      })();
    `).catch(() => {});
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
