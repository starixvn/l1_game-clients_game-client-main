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

    addDialog(cbFunction: () => void, name: string) {
        if (!this.isDialogOpened) {
            cbFunction();
            this.isDialogOpened = true;
        } else {
            const alreadyQueued = this.queue.some((item) => item.name === name);
            if (!alreadyQueued) {
                this.queue.push({ cb: cbFunction, name });
            }
        }
    }

    onCloseDialog() {
        if (this.queue.length > 0) {
            const { cb } = this.queue.shift();
            cb();
            this.isDialogOpened = true;
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
