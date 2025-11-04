import { BundleManager } from "bundle-management";

import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { getGameConfiguration } from "../../../configs/GameConfigurations";
import { SystemType } from "../../../ISystem";
import BannerJackpot from "./BannerJackpot";

const { ccclass, property } = cc._decorator;

export interface JackpotPoolInfo {
    gameId: number;
    amount: number;
    pool: number;
}

@ccclass
export default class BannerJackpotPoolItem extends BannerJackpot {
    @property(cc.Sprite)
    gameIcon: cc.Sprite = null;

    @property(cc.Label)
    gameName: cc.Label = null;

    @property(cc.Label)
    poolAmount: cc.Label = null;

    async setData(data: JackpotPoolInfo) {
        const { gameId, amount } = data;
        this.gameId = gameId;
        const gameName = await GameUtils.getDisplayGameName(gameId);
        this.gameName.string = gameName.length > 16 ? `${gameName.slice(0, 13)}...` : gameName;
        this.poolAmount.string = numberWithCommas(GameUtils.getValueByCurrency(amount), 2, false);

        const frame = await GameUtils.asyncExecute(this?.node, this.getGameIcon());
        frame && (this.gameIcon.spriteFrame = frame);
    }

    protected async getRemoteGameIcon(gameId: number) {
        try {
            const versions = await GameUtils.getRemoteVersion(gameId);
            const texture = await GameUtils.loadRemoteGameResource<cc.Texture2D>(gameId, `icon/icon-game-small.webp?v=${versions?.icon}`);
            return new cc.SpriteFrame(texture);
        } catch (e) {
            return null;
        }
    }

    getGameIcon(): Promise<cc.SpriteFrame> {
        const gameConfiguration = getGameConfiguration(this.gameId);

        if (!!gameConfiguration?.remoteBundle) {
            return BundleManager.getInstance().loadAsset<cc.SpriteFrame>({
                bundleId: this.gameId.toString(),
                path: "resources/textures/icon-game-small",
                type: cc.SpriteFrame
            });
        } else if (gameConfiguration?.isMicrosite) {
            return this.getRemoteGameIcon(this.gameId);
        } else {
            return new Promise((resolve) => {
                cc.resources.load<cc.SpriteFrame>(
                    `lobby/games/${SystemType.SC2}/icon-game-small-${this.gameId}`,
                    cc.SpriteFrame,
                    (err, frame) => {
                        if (frame) {
                            resolve(frame);
                        }
                    }
                );
            });
        }
    }
}
