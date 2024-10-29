import { lazyInject } from "../../Application";
import GameUtils from "../../common/GameUtils";
import { userManager } from "../../common/user/UserManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { StorageManager } from "../../managers/StorageManager";
import LobbyMenuConfig from "../main/view-models/LobbyMenuConfig";
import CenterBanner from "./center-banner";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CenterBannerContainer extends cc.Component {
    @property(cc.Prefab)
    bannerPrefab: cc.Prefab = null;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    private readonly storageKey = "center-banner-dont-show-again";
    onLoad() {
        uiManager.emitterListener(InternalEvents.CENTER_BANNER_SHOW, this.initCenterBanner.bind(this), this);
    }

    onDestroy(): void {
        uiManager.removeListenersWithTarget(this);
    }

    async initCenterBanner() {
        const offerBannerIds = this.lobbyMenuConfig.bannerAds.filter((id) => userManager.offerGames.includes(id));
        const list = offerBannerIds.slice(0, 1); //only first banner
        const dontShowAgainStorage = StorageManager.get(this.storageKey);

        const filterList = list.filter((id) => {
            if (!dontShowAgainStorage) {
                return true;
            }
            return !dontShowAgainStorage[id];
        });
        for (const gameId of filterList) {
            try {
                const path = `center-banners/${gameId}`;
                const versionsPath = `${path}/versions.json`;
                const data = await GameUtils.loadRemoteFromSharedResource<any>(versionsPath);

                let success = false;
                if (data) {
                    const languages = [window.i18n.curLang, "en", "vi"];
                    for (const lang of languages) {
                        const fileName = `${lang}.webp`;
                        if (data.json[fileName]) {
                            const imageAsset = await GameUtils.loadRemoteFromSharedResource<cc.Texture2D>(`${path}/${fileName}`);
                            if (imageAsset) {
                                const spriteFrame = new cc.SpriteFrame();
                                spriteFrame.setTexture(imageAsset);

                                this.showBanner(gameId, spriteFrame);
                                success = true;
                                break;
                            }
                        }
                    }

                    if (success) {
                        break;
                    }
                }
            } catch (e) {
                continue;
            }
        }
    }

    showBanner(gameId: number, spriteFrame: cc.SpriteFrame) {
        const node = cc.instantiate(this.bannerPrefab);
        this.node.addChild(node);

        const banner = node.getComponent(CenterBanner);
        banner.init(gameId, spriteFrame, this.storageKey);
    }
}
