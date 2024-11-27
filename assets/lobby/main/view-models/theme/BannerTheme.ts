import Banner from "../Banner";
import { lobbyResourceManager } from "../LobbyResourceManager";

const { ccclass } = cc._decorator;

@ccclass
export default class BannerTheme extends Banner {
    protected override getPrefabBannerContainer() {
        return lobbyResourceManager?.loadPrefab("banner/bannerContainer");
    }

    protected override getPathJackpotContainer() {
        return lobbyResourceManager?.loadPrefab("banner/jackpotController");
    }

    protected override getPathJackpotNavigation() {
        return lobbyResourceManager?.loadPrefab("banner/jackpotNavigation");
    }
}
