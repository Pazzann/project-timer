// electron.js / main.cjs
const {app, BrowserWindow, screen, ipcMain} = require('electron');
const path = require('path');
const {spawn} = require('child_process');
const fs = require('fs');

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


// Ensure "saves" directory exists
if (!fs.existsSync(path.join(__dirname, "saves")))
    fs.mkdirSync(path.join(__dirname, "saves"));


async function test(){
    const image = await mainWindow.webContents.capturePage(captureRect);
}

let mainPort; // We will store the port from the renderer here





// Listen for the MessageChannel port
ipcMain.on('setup-shared-memory', (event) => {
    // The port is in event.ports[0]
    mainPort = event.ports[0];

    // Now, the main process can "talk" to the renderer
    // and listen for messages on this port
    mainPort.on('message', (event) => {
        // This is where you will receive the SharedArrayBuffer
        const sharedBuffer = event.data;

        // Create a Uint8Array view on the *same* memory
        const uint8View = new Uint8Array(sharedBuffer);

        console.log('MAIN: Received SharedArrayBuffer');

        // Let's modify the buffer to prove it's shared
        // Write "123" to the first byte
        console.log(`MAIN: Value before write: ${uint8View[0]}`);
        uint8View[0] = 123;
        console.log(`MAIN: Wrote 123 to index 0. Value is now: ${uint8View[0]}`);
    });

    // Start the port
    mainPort.start();
});



// --- Electron App Lifecycle (remains the same) ---
const createWindow = () => {
    console.log("Creating browser window...");
    mainWindow = new BrowserWindow({
        width: 840,
        height: 700,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            backgroundThrottling: false,
            sandbox: false
        },
    });

    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp'
            }
        });
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
    //mainWindow.setMenu(null);
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
