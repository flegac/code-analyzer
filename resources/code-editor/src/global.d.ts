export {};

declare global {
    interface Window {
        api: {
            loadFile: () => Promise<string | null>;
            onFileOpened: (callback: (content: string) => void) => void;

            onRequestSave: (callback: () => void) => void;
            saveFile: (content: string) => void;
        };
    }
}
