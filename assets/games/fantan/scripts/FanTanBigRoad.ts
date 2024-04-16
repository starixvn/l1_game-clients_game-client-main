import ExtendedGameLogControl from "../../_base/view-models/ExtendedGameLogControl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FanTanBigRoad extends ExtendedGameLogControl {
    @property(cc.Label)
    percent1Fan: cc.Label = null;

    @property(cc.Label)
    percent2Fan: cc.Label = null;

    @property(cc.Label)
    percent3Fan: cc.Label = null;

    @property(cc.Label)
    percentFan: cc.Label = null;

    setPercentFan(data: any) {}
}
