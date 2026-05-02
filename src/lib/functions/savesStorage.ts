// Unified saves storage: uses Electron's filesystem when available,
// otherwise falls back to the browser's localStorage.

const LS_PREFIX = "project-timer-save:";

export const isElectronEnv: boolean =
    typeof window !== "undefined" && !!(window as any)?.api?.isElectron;

export function listSaves(): string[] {
    if (isElectronEnv) {
        return (window as any).api.fs
            .readdir()
            .filter((f: string) => f.endsWith(".json"));
    }
    const out: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(LS_PREFIX)) {
            out.push(key.slice(LS_PREFIX.length));
        }
    }
    return out.sort();
}

export function readSave(fileName: string): string | null {
    if (isElectronEnv) {
        try {
            return (window as any).api.fs.readFile(fileName) as string;
        } catch {
            return null;
        }
    }
    return localStorage.getItem(LS_PREFIX + fileName);
}

export function writeSave(fileName: string, data: string): void {
    if (isElectronEnv) {
        (window as any).api.fs.writeFile(fileName, data);
        return;
    }
    try {
        localStorage.setItem(LS_PREFIX + fileName, data);
    } catch (e) {
        console.error("Failed to write save to localStorage:", e);
    }
}

export function deleteSave(fileName: string): void {
    if (isElectronEnv) {
        (window as any).api.fs.removeFile(fileName);
        return;
    }
    localStorage.removeItem(LS_PREFIX + fileName);
}

export function openSavesLocation(): void {
    if (isElectronEnv) {
        (window as any).api.openSaves();
        return;
    }
    // No physical location in browser — saves live in localStorage.
    // Could open devtools instructions, but for now just a no-op alert.
    alert(
        "Saves are stored in your browser's local storage. " +
        "They persist across reloads but are tied to this browser/profile."
    );
}
