import StandAloneTableGameHistoryItem from "../../../_base_new/view-models/StandAloneTableGameHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FanTanHistoryItem extends StandAloneTableGameHistoryItem {
    @property(cc.Sprite)
    result: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    handleResult(result: any) {
        this.result.spriteFrame = this.atlas.getSpriteFrame("khuvuc_ketqua_" + result.finalBeads);
    }
}
