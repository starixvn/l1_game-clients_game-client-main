export enum BlockchainBaccaratEvents {
    OPEN_VERIFICATION = "openVerification",
    FLIPPED_CARD = "flippedCard",
    CHANGE_CARD = "change_card",
    RESET_CARD_SELECTED = "resetCardSelected",
    OPENED_CARD = "openedCard"
}

export function emitEvent(eventName: string, params?: object) {
    const mainNode = cc.find("Canvas/Main");
    if (mainNode) {
        mainNode.emit(eventName, params);
    }
}

export function consumeEvent(eventName: string, callback: (params: object) => void) {
    const mainNode = cc.find("Canvas/Main");
    if (mainNode) {
        mainNode.on(eventName, (params: object) => {
            callback(params);
        });
    }
}
