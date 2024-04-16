import StandAloneTableGameTicketDetail from "../../../_base_new/view-models/StandAloneTableGameTicketDetail";
import FanTanTicketDetailItem from "./FanTanTicketDetailItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FanTanTicketDetail extends StandAloneTableGameTicketDetail {
    @property(cc.Sprite)
    result: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    handleResult(result: any) {
        this.result.spriteFrame = this.atlas.getSpriteFrame("khuvuc_ketqua_" + result.finalBeads);
    }

    setData(data: any) {
        this.handleResult(data.result);
        this.roundId.string = data.roundId;
        const { settlementResult } = data;
        let index = 0;
        Object.keys(settlementResult).forEach((choice) => {
            if (data[choice] > 0) {
                const ticketItem = cc.instantiate(this.itemPrefab);
                const control = ticketItem.getComponent(FanTanTicketDetailItem);
                control.setData(data, choice, index, settlementResult[choice]);
                this.content.addChild(ticketItem);
                index++;
            }
        });
    }
}
