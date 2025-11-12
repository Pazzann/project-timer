// Type definitions for the safe preload API exposed via contextBridge (synchronous)

export {};

declare global {
    interface SafeFs {
        readFile(filePath: string, encoding?: string | null): string | Buffer;
        writeFile(filePath: string, data: string | Buffer, options?: any): boolean;
        readdir(dir?: string): string[];
        unlink(filePath: string): void;
        // Convenience wrapper that returns a boolean and swallows/logs errors instead of throwing
        removeFile(filePath: string): boolean;
        stat(filePath: string): import('fs').Stats;
        exists(filePath: string): boolean;
    }

    interface PreloadApi {
        isElectron: true;
        fs: SafeFs;
        fsBaseName: string;
        sendPortToMain(MessagePort): void;
    }

    interface Window {
        api: PreloadApi;
    }
}
