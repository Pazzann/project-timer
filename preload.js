// preload.js
const { contextBridge } = require('electron');

// We "expose" a new 'api' object to the window (your HTML page)
// This is a secure way to pass information
contextBridge.exposeInMainWorld('api', {
    isElectron: true
});