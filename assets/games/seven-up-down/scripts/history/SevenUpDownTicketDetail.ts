import GameTicketDetailBase from "../../../_base/view-models/GameTicketDetailBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownTicketDetail extends GameTicketDetailBase {
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    setData(data: any, symbolSprites: cc.SpriteFrame[]) {
        const { betLogDetails, odds, settlementResult } = data;
        this.scrollView?.scrollToTop(0.1);
    }
}
