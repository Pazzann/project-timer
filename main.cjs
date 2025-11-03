// electron.js / main.cjs
const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// --- Configuration ---
const CAM_FPS = 30;
// Output filename for testing
const OUTPUT_FILENAME = "output_dynamic.mp4"; // Use a distinct name

// --- FFmpeg Setup ---
const ffmpegPath = app.isPackaged
    ? path.join(process.resourcesPath, 'ffmpeg.exe').replace('app.asar', 'app.asar.unpacked')
    : path.join(__dirname, 'ffmpeg', 'ffmpeg.exe');

let ffmpegProcess = null;
let currentInputWidth = 0;
let currentInputHeight = 0;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow;
let captureInterval;
let isCapturing = false;
let ffmpegRestartTimeout = null;
let captureRect = { x: 0, y: 0, width: 1280, height: 720 };


// --- Frame Capture and Piping Function ---
const captureAndPipeFrame = async () => {
    if (!isCapturing || !mainWindow || mainWindow.isDestroyed() || mainWindow.isMinimized()) {
        return;
    }
    try {
        const image = await mainWindow.webContents.capturePage(captureRect);
        const imageSize = image.getSize();
        const actualWidth = imageSize.width;
        const actualHeight = imageSize.height;

        if (actualWidth === 0 || actualHeight === 0) {
            console.warn("Captured empty frame, skipping.");
            return;
        }

        // Start/Restart FFmpeg if necessary BEFORE checking stdin
        if (!ffmpegProcess || actualWidth !== currentInputWidth || actualHeight !== currentInputHeight) {
            console.log(`Detected capture size: ${actualWidth}x${actualHeight}. (Re)starting FFmpeg (to file) with this size.`);
            await stopStreaming(); // Stop current FFmpeg gracefully (if any)
            currentInputWidth = actualWidth;
            currentInputHeight = actualHeight;
            startStreaming(currentInputWidth, currentInputHeight); // Start new FFmpeg with correct size
            await new Promise(resolve => setTimeout(resolve, 200));
            if (!ffmpegProcess || ffmpegProcess.killed || !ffmpegProcess.stdin || ffmpegProcess.stdin.writableEnded) {
                console.error("FFmpeg process (to file) not ready after start/restart attempt. Skipping frame.");
                currentInputWidth = 0; currentInputHeight = 0; return;
            }
        }

        // Double check if FFmpeg is ready
        if (!ffmpegProcess || !ffmpegProcess.stdin || ffmpegProcess.stdin.writableEnded) {
            console.warn("captureAndPipeFrame (to file): FFmpeg process or stdin became unavailable unexpectedly. Waiting...");
            return;
        }

        // Proceed to write the buffer
        const buffer = image.toBitmap();
        const expectedSize = actualWidth * actualHeight * 4;
        if (buffer.length !== expectedSize) {
            console.error(`CRITICAL (to file): Buffer size ${buffer.length} doesn't match calculated size ${expectedSize} for ${actualWidth}x${actualHeight}`);
            await stopStreaming(); return;
        }

        // Write buffer and handle backpressure
        const canWrite = ffmpegProcess.stdin.write(buffer);
        if (!canWrite && isCapturing) {
            isCapturing = false;
            ffmpegProcess.stdin.once('drain', () => {
                if (ffmpegProcess && !ffmpegProcess.killed) { isCapturing = true; }
                else { console.log("Not resuming capture (to file) as FFmpeg process is no longer active."); }
            });
        }
    } catch (e) {
        if (e.message.includes('WebContents was destroyed') || e.message.includes('captured page is empty') || e.message.includes('Invalid bitmap data')) {
            if (Math.random() < 0.05) console.warn('Frame capture (to file) skipped:', e.message);
        } else {
            console.error('Frame capture (to file) failed unexpectedly:', e);
            await stopStreaming();
        }
    }
};


// --- FFmpeg Process Management ---
function startStreaming(inputWidth, inputHeight) {
    if (!inputWidth || !inputHeight) {
        console.error("startStreaming (to file) called without dimensions."); return;
    }
    if (ffmpegProcess) { console.warn("Attempted to start FFmpeg (to file), but it seems to be running."); return; }
    clearTimeout(ffmpegRestartTimeout);

    currentInputWidth = inputWidth; currentInputHeight = inputHeight;

    // *** Args changed to output to FILE ***
    const args = [
        '-loglevel', 'error',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-pix_fmt', 'bgra',
        '-s', `${inputWidth}x${inputHeight}`, // Use dynamic size
        '-r', `${CAM_FPS}`,
        '-i', '-', // Input from stdin
        // Encoding settings for the file
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-y', // Overwrite output file without asking
        OUTPUT_FILENAME // Output filename
    ];

    console.log('Using FFmpeg at:', ffmpegPath);
    console.log(`Spawning FFmpeg to FILE: ${ffmpegPath} ${args.join(' ')}`);

    try {
        ffmpegProcess = spawn(ffmpegPath, args, { stdio: ['pipe', 'pipe', 'pipe'] });

        // Event Handlers (mostly same, logging updated slightly)
        ffmpegProcess.stdin.on('error', (err) => {
            if (err.code !== 'EPIPE' && err.code !== 'ERR_STREAM_WRITE_AFTER_END' && err.code !== 'ERR_STREAM_DESTROYED') {
                console.error('FFmpeg stdin error (to file):', err.message); isCapturing = false; currentInputWidth = 0; currentInputHeight = 0;
            }
        });
        ffmpegProcess.stderr.on('data', (data) => console.error(`FFmpeg stderr (to file): ${data.toString().trim()}`));
        ffmpegProcess.stdout.on('data', (data) => console.log(`FFmpeg stdout (to file): ${data.toString().trim()}`));
        ffmpegProcess.on('close', (code) => {
            console.log(`FFmpeg process (to file) exited with code ${code}`);
            const wasRunning = !!ffmpegProcess;
            ffmpegProcess = null; currentInputWidth = 0; currentInputHeight = 0;
            if (isCapturing && code !== 0 && code !== null && !app.isQuitting()) {
                console.log("FFmpeg (to file) closed unexpectedly, attempting restart in 2 seconds...");
                if (ffmpegRestartTimeout) clearTimeout(ffmpegRestartTimeout);
                ffmpegRestartTimeout = setTimeout(() => {
                    console.log("Restart timer (to file) expired, capture loop will now attempt restart.");
                    ffmpegRestartTimeout = null;
                }, 2000);
            } else {
                isCapturing = false;
                if (captureInterval) {clearInterval(captureInterval); captureInterval = null;}
            }
        });
        ffmpegProcess.on('error', (err) => {
            console.error('Failed to start FFmpeg process (to file):', err.message);
            isCapturing = false; currentInputWidth = 0; currentInputHeight = 0; ffmpegProcess = null;
        });

        console.log("FFmpeg process (to file) spawned successfully.");

    } catch(err) {
        console.error("Error spawning FFmpeg (to file):", err);
    }
}

// stopStreaming remains the same
function stopStreaming() {
    return new Promise(async (resolve) => {
        const wasCapturing = isCapturing;
        console.log("Stopping stream (to file)...");
        isCapturing = false;
        clearTimeout(ffmpegRestartTimeout);
        if (captureInterval) { clearInterval(captureInterval); captureInterval = null; console.log("Capture interval (to file) cleared."); }

        const procToKill = ffmpegProcess;
        if (procToKill && !procToKill.killed) {
            ffmpegProcess = null; currentInputWidth = 0; currentInputHeight = 0;
            console.log("Ending FFmpeg stdin (to file)...");
            if (procToKill.stdin && !procToKill.stdin.writableEnded) {
                try {
                    await Promise.race([
                        new Promise((endResolve, endReject) => {
                            procToKill.stdin.end((err) => {
                                if (err && err.code !== 'EPIPE' && err.code !== 'ERR_STREAM_WRITE_AFTER_END' && err.code !== 'ERR_STREAM_DESTROYED') {
                                    console.error("Error ending FFmpeg stdin (to file):", err.message); endReject(err);
                                } else { console.log("FFmpeg stdin (to file) ended gracefully."); endResolve(); }
                            });
                        }),
                        new Promise(resolveTimeout => setTimeout(() => { console.warn("FFmpeg stdin end() (to file) timed out."); resolveTimeout(); }, 500))
                    ]);
                } catch (endErr) { console.warn("Ignoring stdin end error (to file) during shutdown:", endErr ? endErr.message : 'Unknown'); }
            } else { console.log("FFmpeg stdin (to file) already ended or not available."); }
            await killFFmpegProcess(procToKill);
        } else { console.log(`FFmpeg process (to file) already stopped or null. (Was capturing: ${wasCapturing})`); }
        resolve();
    });
}

// killFFmpegProcess remains the same...
function killFFmpegProcess(proc) {
    return new Promise((resolve) => {
        if (!proc || proc.killed) { return resolve(); }
        let killed = false; const killTimeout = 500;
        proc.once('exit', () => { console.log("FFmpeg process confirmed exit."); killed = true; clearTimeout(forceKillTimer); resolve(); });
        console.log("Killing FFmpeg process (SIGTERM)..."); proc.kill('SIGTERM');
        const forceKillTimer = setTimeout(() => {
            if (!killed && proc && !proc.killed) { console.log("Forcing FFmpeg shutdown (SIGKILL)..."); proc.kill('SIGKILL'); setTimeout(resolve, 100); }
            else { resolve(); }
        }, killTimeout);
    });
}


// --- Electron App Lifecycle (remains the same) ---
const createWindow = () => {
    console.log("Creating browser window...");
    mainWindow = new BrowserWindow({ width: 1280, height: 720, webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true } });
    console.log("Loading window content...");
    if (process.env.VITE_DEV_SERVER_URL) { mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL); }
    else { const indexPath = path.join(__dirname, 'dist', 'index.html'); console.log(`Loading production build from: ${indexPath}`); mainWindow.loadFile(indexPath); }
    mainWindow.on('closed', () => { mainWindow = null; });
    mainWindow.webContents.on('did-fail-load', (e, code, desc, url) => console.error(`Window content failed to load: ${desc} (Code: ${code}) URL: ${url}`));
    mainWindow.webContents.on('did-finish-load', () => console.log("Window content finished loading."));
};
app.whenReady().then(() => {
    console.log("App ready, creating window...");
    createWindow();
    if (mainWindow) {
        mainWindow.webContents.once('did-finish-load', () => {
            console.log("Window finished loading, starting capture interval (for file output test).");
            isCapturing = true;
            if (captureInterval) clearInterval(captureInterval);
            captureInterval = setInterval(captureAndPipeFrame, 1000 / CAM_FPS);
            console.log("Capture interval started. Waiting for first frame to initialize FFmpeg (to file)...");
        });
    } else { console.error("Main window not created."); app.quit(); }
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('will-quit', async (event) => {
    console.log("App will quit, ensuring FFmpeg (to file) is stopped...");
    event.preventDefault(); await stopStreaming(); app.quit();
});
app.on('quit', () => { console.log("App quit."); });

