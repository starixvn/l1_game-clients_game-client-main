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
            console.log("open dialog", name);
        } else {
            this.queue.push({ cb: cpFunction, name: name });
            console.log("add dialog to queue", name);
        }
    }

    onCloseDialog() {
        if (this.queue.length > 0) {
            const { cb, name } = this.queue.shift();
            cb();
            console.log("close dialog", name);
            this.isDialogOpened = false;
        }
        this.isDialogOpened = false;
    }

    clearQueue() {
        this.queue = [];
        this.isDialogOpened = false;
        this.name = "";
        this.isCleared = true; // ✅ Đánh dấu đã clear
        console.log("clear queue");
    }

    reset() {
        this.isCleared = false;
        console.log("dialog manager reset");
    }
}
