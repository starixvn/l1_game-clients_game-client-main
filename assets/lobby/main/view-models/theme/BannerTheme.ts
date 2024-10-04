import Banner from "../Banner";
import LobbyResourceManager from "../LobbyResourceManager";

const { ccclass } = cc._decorator;

@ccclass
export default class BannerTheme extends Banner {
    protected override getPrefabBannerContainer() {
        return LobbyResourceManager.loadPrefabResource("banner/bannerContainer");
    }

    protected override getPathJackpotContainer() {
        return LobbyResourceManager.loadPrefabResource("banner/jackpotController");
    }

    protected override getPathJackpotNavigation() {
        return LobbyResourceManager.loadPrefabResource("banner/jackpotNavigation");
    }
}
