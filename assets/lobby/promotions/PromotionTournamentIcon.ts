import GameUtils from "../../common/GameUtils";
import AudioManager from "../../common/audio/AudioManager";
import { uiManager } from "../../managers/GameUIManager";
import { PromotionTournamentEvents, promotionTournamentHandler } from "./PromotionTournamentHandler";
import configs = require("../../configs/Configs");

const { ccclass } = cc._decorator;

@ccclass
export default class PromotionTournamentIcon extends cc.Component {
    private icon: cc.Node = null;
    private iconPrb: cc.Prefab = null;

    protected onLoad(): void {
        this.icon && (this.icon.active = false);
        configs.subPromotionDomain && promotionTournamentHandler.init();
        promotionTournamentHandler.on(PromotionTournamentEvents.TOGGLE_ICON, this.toggleIcon.bind(this));
    }

    protected onDestroy(): void {
        promotionTournamentHandler.clear();
    }

    async toggleIcon(isActive: boolean) {
        if (isActive && !this.icon) {
            this.createIcon();
        }
        this.icon && (this.icon.active = isActive);
    }

    async createIcon() {
        try {
            const key = "promotionTournamentIcon";
            if (!uiManager.prefabCache.miniPanelIcons[key]) {
                this.iconPrb = await GameUtils.asyncExecute<cc.Prefab>(
                    this.node,
                    GameUtils.loadResource("promotion-tournament/views/icon")
                );
                uiManager.prefabCache.miniPanelIcons[key] = this.iconPrb;
            } else {
                this.iconPrb = uiManager.prefabCache.miniPanelIcons[key];
            }
            this.icon = cc.instantiate(this.iconPrb);
            this.icon.on("click", this.onClick, this);
            this.node.addChild(this.icon);
        } catch (e) {
            console.warn(e);
        }
    }

    onClick() {
        AudioManager.getInstance().playClick();
        promotionTournamentHandler.emit(PromotionTournamentEvents.OPEN_PROMOTION_TOURNAMENT);
    }
}
