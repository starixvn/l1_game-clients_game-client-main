interface Storage {
    remove: (name: string) => void;
    get: (name: string) => any;
    set: (name: string, value: any, expiresDay?: number) => void;
    isAvailable: () => boolean;
}

function isString(value: any): value is string {
    return typeof value === "string";
}

class SessionStorage implements Storage {
    remove(name: string) {
        sessionStorage?.removeItem(name);
    }

    get(name: string) {
        let storage;
        try {
            storage = sessionStorage.getItem(name);
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
        sessionStorage?.setItem(name, valueFormat);
    }

    isAvailable() {
        const test = "test";
        try {
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
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

class Memory implements Storage {
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

class StorageManager {
    private static _storage: Storage;

    private static get storage() {
        if (!this._storage) {
            const storages = [new SessionStorage(), new Memory()];
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

export { StorageManager };
