import GameUtils from "../../common/GameUtils";
import { uiManager } from "../../managers/GameUIManager";
import { PromotionTournamentEvents, promotionTournamentHandler } from "./PromotionTournamentHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromotionTournamentPopup extends cc.Component {
    @property(cc.Node)
    dialog: cc.Node = null;

    private promotionTournamentPrefab: cc.Prefab = null;

    protected onLoad(): void {
        promotionTournamentHandler.on(PromotionTournamentEvents.OPEN_PROMOTION_TOURNAMENT, this.showPromotionTournament.bind(this));
    }

    async showPromotionTournament() {
        if (!this.promotionTournamentPrefab) {
            await this.createPromotionTournamentPrefab();
        }
        const node = cc.instantiate(this.promotionTournamentPrefab);
        this.addDialog(node);
    }

    async createPromotionTournamentPrefab() {
        const key = "promotionTournament";
        if (!uiManager.prefabCache.miniPanelIcons[key]) {
            this.promotionTournamentPrefab = await GameUtils.asyncExecute<cc.Prefab>(
                this.node,
                GameUtils.loadResource("promotion-tournament/views/PromotionTournamentWebView")
            );
            uiManager.prefabCache.miniPanelIcons[key] = this.promotionTournamentPrefab;
        } else {
            this.promotionTournamentPrefab = uiManager.prefabCache.miniPanelIcons[key];
        }
    }

    addDialog(dialogNode: cc.Node) {
        this.dialog?.addChild(dialogNode);
    }
}
