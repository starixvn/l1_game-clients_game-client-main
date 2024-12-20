import Banner from "../Banner";
import { lobbyResourceManager } from "../LobbyResourceManager";

const { ccclass } = cc._decorator;

@ccclass
export default class BannerTheme extends Banner {
    protected override getPrefabBannerContainer() {
        return lobbyResourceManager?.resourceLoader?.loadPrefab("banner/bannerContainer");
    }

    protected override getPathJackpotContainer() {
        return lobbyResourceManager?.resourceLoader?.loadPrefab("banner/jackpotController");
    }

    protected override getPathJackpotNavigation() {
        return lobbyResourceManager?.resourceLoader?.loadPrefab("banner/jackpotNavigation");
    }
}
