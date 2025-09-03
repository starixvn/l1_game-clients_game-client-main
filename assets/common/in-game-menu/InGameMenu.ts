import AudioManager from "../audio/AudioManager";
import ExpandableMenu from "../expandable-menu/view-models/ExpandableMenu";
import DirectModeVisibility, { NodeType } from "../other-lobby/DirectModeVisibility";

const { ccclass, property } = cc._decorator;
export enum InGameMenuEvents {
    OPEN_HISTORY = "open_history",
    OPEN_GUIDE = "open_guide",
    OPEN_TICKET_DETAIL = "open_ticket_detail",
    OPEN_STATISTIC = "open_statistic",
    CLOSE_GAME = "close_game",
    GO_TO_LOBBY = "go_to_lobby",
    CHANGE_ORIENTATION = "change_orientation",
    CHANGE_SWAP_CARD = "change_swap_card",
    CHANGE_WINNING_NOTIFICATION = "change_winning_notification",
    OPEN_PROVABLY_FAIR = "open_provably_fair"
}

@ccclass
export default class InGameMenu extends cc.Component {
    @property(ExpandableMenu)
    expandableMenu: ExpandableMenu = null;

    onLoad() {
        this.addComponentDirectModeVisibility();
    }

    addComponentDirectModeVisibility() {
        const buttons = this.node.getComponentsInChildren(cc.Button);
        buttons.forEach(button => {
            if (button.node.name.includes("lobby")) {
                if (button.getComponent(DirectModeVisibility)) {
                    return;
                }
                button.addComponent(DirectModeVisibility).type = NodeType.Lobby;
            }
        });
    }

    protected doCommons() {
        AudioManager.getInstance().playClick();
        this.expandableMenu && this.expandableMenu.collapseMenu();
    }

    collapseMenu(animated: boolean) { }

    onClickOpenHistory() {
        this.doCommons();
        this.node.emit(InGameMenuEvents.OPEN_HISTORY);
    }

    onClickOpenGuide() {
        this.doCommons();
        this.node.emit(InGameMenuEvents.OPEN_GUIDE);
    }

    onClickOpenTicketDetails() {
        this.doCommons();
        this.node.emit(InGameMenuEvents.OPEN_TICKET_DETAIL);
    }

    onClickCloseGame() {
        this.doCommons();
        this.node.emit(InGameMenuEvents.CLOSE_GAME);
    }

    onClickGoToLobby() {
        this.doCommons();
        this.node.emit(InGameMenuEvents.GO_TO_LOBBY);
    }

    onClickChangeOrientation() {
        this.doCommons();
        this.node.emit(InGameMenuEvents.CHANGE_ORIENTATION);
    }

    onClickStatistics() {
        this.doCommons();
        this.node.emit(InGameMenuEvents.OPEN_STATISTIC);
    }

    onClickProvablyFair() {
        this.doCommons();
        this.node.emit(InGameMenuEvents.OPEN_PROVABLY_FAIR);
    }
}
