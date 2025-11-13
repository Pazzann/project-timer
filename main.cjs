// electron.js / main.cjs
const {app, BrowserWindow, screen, ipcMain,shell} = require('electron');
const path = require('path');
const {spawn} = require('child_process');
const fs = require('fs');
const {Camera} = require("@yegorvk/node-vcam")

// --- Configuration ---
let CAM_FPS = 30;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow;
let captureInterval;


const userDataPath = app.getPath('userData');
const savesPath = path.join(userDataPath, 'saves');

ipcMain.on('get-saves-path', (event) => {
    event.returnValue = savesPath;
});

ipcMain.handle('open-saves-folder', async () => {
    // shell.openPath is the command that opens the folder in Explorer/Finder
    await shell.openPath(savesPath);
});

function stopCamera() {
    camera.stop();
    if (captureInterval)
        clearInterval(captureInterval);
}
async function startCamera() {
    camera.start();
    const image = await mainWindow.webContents.capturePage();
    camera.resize(image.getSize().width, image.getSize().height);
    captureInterval = setInterval(async ()=>{camera.send(flipImageVertically(swapRedAndBlue((await mainWindow.webContents.capturePage()).toBitmap()),image.getSize().width,image.getSize().height))}, 1000 / CAM_FPS)
}

ipcMain.on('stop-camera', async () => {
    stopCamera();
})

ipcMain.on('start-camera', async () => {
   startCamera();
})

ipcMain.on('change-fps', async (event, fps) => {
    stopCamera();
    CAM_FPS = fps;
    startCamera();
})


// Ensure "saves" directory exists
if (!fs.existsSync(savesPath))
    fs.mkdirSync(savesPath);



const camera = new Camera(1920, 1080);




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
        icon: path.join(__dirname, 'ProjectTimerLogo.ico')
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
app.whenReady().then(async () => {
    console.log("App ready, creating window...");
    createWindow();
    mainWindow.setMenu(null);
    if (mainWindow) {
        mainWindow.webContents.once('did-finish-load', async () => {
            const image = await mainWindow.webContents.capturePage();
            console.log("Captured initial image size:", image.getSize());
            camera.resize(image.getSize().width, image.getSize().height);
        });
    } else {
        console.error("Main window not created.");
        app.quit();
    }
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

function swapRedAndBlue(buffer) {
    for (let i = 0; i < buffer.length; i += 4) {
        // Get the B and R values
        const b = buffer[i];
        const r = buffer[i + 2];

        // Swap them
        buffer[i] = r;     // Set Blue position to Red value
        buffer[i + 2] = b; // Set Red position to Blue value

        // G (buffer[i + 1]) and A (buffer[i + 3]) remain unchanged

    }
    return buffer;
}

function flipImageVertically(buffer, width, height) {
    // Allocate memory for the new, flipped buffer
    const flippedBuffer = Buffer.alloc(buffer.length);

    // Calculate the 'stride', which is the number of bytes per row
    const stride = width * 4; // 4 bytes per pixel

    // Loop through each row of the original image
    for (let y = 0; y < height; y++) {
        const srcRow = y;
        const destRow = height - 1 - y; // The corresponding row in the new buffer

        // Calculate the start of each row in bytes
        const srcOffset = srcRow * stride;
        const destOffset = destRow * stride;

        // Copy the entire row from source to destination
        buffer.copy(flippedBuffer, destOffset, srcOffset, srcOffset + stride);
    }

    return flippedBuffer;
}


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('will-quit', async (event) => {
    event.preventDefault();
});
app.on('quit', () => {
    stopCamera();
    app.quit();
});
