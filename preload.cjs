// preload.cjs
const { contextBridge } = require('electron');
const path = require('path');
const fs = require('fs');

// Restrict filesystem access to the project's `saves` directory
const allowedBase = path.resolve(__dirname, 'saves');

function normalizeAndEnsureInside(base, userPath) {
    // Resolve relative to the allowed base to prevent path traversal
    const target = path.resolve(base, userPath || '.');
    const relative = path.relative(base, target);

    // On Windows, path.relative may be case-insensitive; normalize case for comparison
    const relNormalized = relative.split(path.sep).join('/');

    if (relNormalized === '' || (!relNormalized.startsWith('..') && !path.isAbsolute(relNormalized))) {
        return target;
    }
    throw new Error('Access to the path is denied');
}

// Small, safe FS surface that only operates inside `saves` (synchronous version)
const safeFs = {
    readFile: (filePath, encoding = 'utf8') => {
        const p = normalizeAndEnsureInside(allowedBase, filePath);
        return fs.readFileSync(p, encoding);
    },

    writeFile: (filePath, data, options) => {
        const p = normalizeAndEnsureInside(allowedBase, filePath);
        // Ensure parent directory exists
        fs.mkdirSync(path.dirname(p), { recursive: true });
        fs.writeFileSync(p, data, options);
        return true;
    },

    readdir: (dir = '.') => {
        const p = normalizeAndEnsureInside(allowedBase, dir);
        return fs.readdirSync(p);
    },

    unlink: (filePath) => {
        const p = normalizeAndEnsureInside(allowedBase, filePath);
        return fs.unlinkSync(p);
    },

    // Convenience wrapper that returns a boolean and swallows/logs errors instead of throwing
    removeFile: (filePath) => {
        try {
            const p = normalizeAndEnsureInside(allowedBase, filePath);
            if (!fs.existsSync(p)) {
                // nothing to do
                return false;
            }
            fs.unlinkSync(p);
            return true;
        } catch (err) {
            try { console.error('[preload] removeFile error:', err); } catch (e) {}
            return false;
        }
    },

    stat: (filePath) => {
        const p = normalizeAndEnsureInside(allowedBase, filePath);
        return fs.statSync(p);
    },

    exists: (filePath) => {
        try {
            const p = normalizeAndEnsureInside(allowedBase, filePath);
            fs.accessSync(p);
            return true;
        } catch (err) {
            return false;
        }
    }
};

// Expose a minimal API to the renderer
contextBridge.exposeInMainWorld('api', {
    isElectron: true,
    fs: safeFs,
    // Expose the base name so the renderer can show where saves are stored without leaking the full path
    fsBaseName: 'saves'
});

// Note: we do NOT attach fs to window directly to avoid untrusted code getting full node fs access
