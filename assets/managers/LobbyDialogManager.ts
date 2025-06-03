export default class LobbyDialogManager {
    private static instance: LobbyDialogManager;

    public static getInstance(): LobbyDialogManager {
        if (!this.instance) {
            this.instance = new LobbyDialogManager();
        }
        return this.instance;
    }

    isDialogOpened = false;
    name = "";
    queue: { cb: () => void; name: string }[] = [];
    isCleared = false;

    addDialog(cpFunction: () => void, name: string) {
        if (!this.isDialogOpened || this.name === name) {
            cpFunction();
            this.isDialogOpened = true;
            this.name = name;
        } else {
            this.queue.push({ cb: cpFunction, name: name });
        }
    }

    onCloseDialog() {
        if (this.queue.length > 0) {
            const { cb } = this.queue.shift();
            cb();
            this.isDialogOpened = false;
        }
        this.isDialogOpened = false;
    }

    clearQueue() {
        this.queue = [];
        this.isDialogOpened = false;
        this.name = "";
        this.isCleared = true;
    }

    reset() {
        this.isCleared = false;
    }
}
