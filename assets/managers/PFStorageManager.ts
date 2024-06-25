declare global {
    interface Window {
        pFStorage: Record<string, object>;
    }
}

export type PFSetting = {
    manualClientSeed: string;
    randomClientSeed: string;
    randomClientSeedEnabled: boolean;
};

class PFStorageMemory {
    pFStorage: Record<string, object>;
    constructor() {
        window.pFStorage = {};
        this.pFStorage = window.pFStorage;
    }
    remove(id: string) {
        delete this.pFStorage[id];
    }

    get(id: string) {
        return this.pFStorage[id] ? this.pFStorage[id] : null;
    }

    set(id: string, value: Record<string, object>) {
        this.pFStorage[id] = value;
    }
}

class PFStorageManager {
    private static _storage: PFStorageMemory;

    private static get storage() {
        if (!this._storage) {
            this._storage = new PFStorageMemory();
        }
        return this._storage;
    }

    static get(name: string) {
        return this.storage.get(name);
    }

    static set(name: string, value: any) {
        this.storage.set(name, value);
    }

    static remove(name: string) {
        this.storage.remove(name);
    }
}

export { PFStorageManager };

