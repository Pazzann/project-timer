// electron.js / main.cjs
const {app, BrowserWindow, screen} = require('electron');
const path = require('path');
const {spawn} = require('child_process');

// --- Configuration ---
const CAM_FPS = 30;

let currentInputWidth = 0;
let currentInputHeight = 0;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow;
let captureInterval;
let isCapturing = false;


// --- Electron App Lifecycle (remains the same) ---
const createWindow = () => {
    console.log("Creating browser window...");
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {preload: path.join(__dirname, 'preload.js'), contextIsolation: true, backgroundThrottling: false}
    });
    console.log("Loading window content...");
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        const indexPath = path.join(__dirname, 'dist', 'index.html');
        console.log(`Loading production build from: ${indexPath}`);
        mainWindow.loadFile(indexPath);
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    mainWindow.webContents.on('did-fail-load', (e, code, desc, url) => console.error(`Window content failed to load: ${desc} (Code: ${code}) URL: ${url}`));
    mainWindow.webContents.on('did-finish-load', () => console.log("Window content finished loading."));
};
app.whenReady().then(() => {
    console.log("App ready, creating window...");
    createWindow();
    if (mainWindow) {
        mainWindow.webContents.once('did-finish-load', () => {

        });
    } else {
        console.error("Main window not created.");
        app.quit();
    }
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('will-quit', async (event) => {
    event.preventDefault();
});
app.on('quit', () => {
    console.log("App quit.");
});

