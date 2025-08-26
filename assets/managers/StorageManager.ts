interface IStorage {
    remove: (name: string) => void;
    get: (name: string) => any;
    set: (name: string, value: any, expiresDay?: number) => void;
    isAvailable: () => boolean;
}

function isString(value: any): value is string {
    return typeof value === "string";
}

class BrowserStorage implements IStorage {
    constructor(private readonly storage: Storage) {}

    remove(name: string) {
        this.storage?.removeItem(name);
    }

    get(name: string) {
        let storage;
        try {
            storage = this.storage?.getItem(name);
            if (storage === "") {
                return null;
            }
            return storage ? JSON.parse(storage) : null;
        } catch (error) {
            return storage ?? null;
        }
    }

    set(name: string, value: any) {
        const valueFormat: string = isString(value) ? value : JSON.stringify(value);
        this.storage?.setItem(name, valueFormat);
    }

    isAvailable() {
        const test = "test";
        try {
            this.storage.setItem(test, test);
            this.storage.removeItem(test);
            return true;
        } catch (e) {
            console.log("Browser not support Local Storage");
            return false;
        }
    }
}

declare global {
    interface Window {
        localMemory: any;
    }
}

class Memory implements IStorage {
    localMemory: any;
    constructor() {
        window.localMemory = {};
        this.localMemory = window.localMemory;
    }
    remove(name: string) {
        delete this.localMemory[name];
    }

    get(name: string) {
        return this.localMemory[name] ? this.localMemory[name] : null;
    }

    set(name: string, value: any) {
        this.localMemory[name] = value;
    }

    isAvailable() {
        return true;
    }
}

export class StorageManager {
    private static _storage: IStorage;

    private static get storage() {
        if (!this._storage) {
            const storages = [new BrowserStorage(sessionStorage), new Memory()];
            this._storage = storages.filter((storage) => storage.isAvailable())[0];
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

export class PermanentStorage {
    private static _storage: IStorage;

    private static get storage() {
        if (!this._storage) {
            const storages = [new BrowserStorage(localStorage), new Memory()];
            this._storage = storages.filter((storage) => storage.isAvailable())[0];
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
