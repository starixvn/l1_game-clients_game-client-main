import { getLocale } from "../../common/auth/SessionManager";
import GameUtils from "../../common/GameUtils";
import WebViewGuide from "../../common/webview-guide/WebViewGuide";
import JackpotPoolInfoBase from "../../lobby/main/view-models/JackpotPoolInfoBase";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import StandardSlotGame from "./StandardSlotGame";
import StandarSlotGuide from "./StandarSlotGuide";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardJackpotSlotGame extends StandardSlotGame {
    @property(cc.Node)
    jackpotPoolNode: cc.Node = null;

    @property(cc.Node)
    topWinnersButton: cc.Node = null;

    private jackpotPoolPrefab: cc.Prefab;
    private isLoadedSlotBoard = false;

    onLoad() {
        super.onLoad();
        uiManager.emitterListener(
            InternalEvents.RECEIVED_JACKPOT_POOLS_IN_GAME,
            (data) => {
                this.jackpotEnabled = data.length > 0;
                this.receiviedJackpotPools = data;
                this.initSlotBoard();
                this.showJackpotInfo();
                this.showHideTopWinnersButton();
            },
            this
        );
    }

    protected getPrefabsList() {
        const normalPrefabs = super.getPrefabsList();
        const jackpotPrefabs = {
            // prefab name : prefab property
            "effect-jackpot": "effectJackpot"
        };
        return Object.assign({}, normalPrefabs, jackpotPrefabs);
    }

    protected getSymbolName(index): string {
        const path = `preload/symbol-spines/`;
        let symbolName = `${path}symbol-${index}`;

        if (index === this.jackpotSymbolIndex && this.jackpotEnabled) {
            const language = getLocale() === "vi-VN" ? `.${getLocale()}` : "";
            symbolName = `${path}symbol-${index}.jackpot${language}`;
        }

        return symbolName;
    }

    async initSlotBoard() {
        if (!this.receiviedJackpotPools || this.isLoadedSlotBoard) {
            return;
        }

        super.initSlotBoard();
        this.isLoadedSlotBoard = true;
    }

    protected async showJackpotInfo() {
        if (!this.jackpotEnabled || !this.jackpotPoolNode || this.jackpotPoolNode.children.length > 0) {
            return;
        }

        await this.loadPrefabWithBundle("jackpot-pool", "jackpotPoolPrefab");
        if (!this.jackpotPoolPrefab) {
            try {
                this.jackpotPoolPrefab = await GameUtils.loadResource(`shared/slot-game/jackpot-pool`);
            } catch (e) {
                cc.warn(`Missing jackpot pool`, e);
            }
        }
        const node = cc.instantiate(this.jackpotPoolPrefab);
        this.jackpotPoolInfo = node.getComponent(JackpotPoolInfoBase);
        this.jackpotPoolNode.addChild(node);
        this.updateJackpotPoolList();
    }

    override updateJackpotPool() {
        // override
    }

    showHideTopWinnersButton() {
        if (!this.topWinnersButton) {
            return;
        }
        this.topWinnersButton.active = this.jackpotEnabled;
    }

    handleGameGuide(guide: WebViewGuide, language, minBet, maxBet, isInPromotionTime) {
        const jackpotGuide = guide as StandarSlotGuide;
        jackpotGuide.enableJackpot = this.jackpotEnabled;
        super.handleGameGuide(guide, language, minBet, maxBet, isInPromotionTime);
    }
}
