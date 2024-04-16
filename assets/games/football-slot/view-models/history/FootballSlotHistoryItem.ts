import { formatDateTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../../_base/view-models/SocketIOHistoryItemBase";
import { BetLog } from "./FootballSlotHistory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FootballSlotHistoryItem extends SocketIOHistoryItemBase {
    @property({ type: cc.Sprite })
    symbol: cc.Sprite = null;

    @property(cc.Label)
    bigSmallValueLabel: cc.Label = null;

    @property(cc.Node)
    bigSymbol: cc.Node = null;

    @property(cc.Node)
    smallSymbol: cc.Node = null;

    @property(cc.Label)
    amountLabel: cc.Label = null;

    betLog: BetLog;

    async setData(betLog: BetLog, index: number, symbolSprites: cc.SpriteFrame[]) {
        this.betLog = betLog;
        this.time.string = formatDateTime(betLog.time);
        this.round.string = betLog.phien.toString();

        const matched = (sprite: cc.SpriteFrame, symbol: string) => sprite.name === symbol;
        const symbolName = betLog.result.isLucky ? "lucky" : this.getSymbolName(betLog.result.symbols[0]);
        this.symbol.spriteFrame = symbolSprites.find((sprite) => matched(sprite, `item_${symbolName}`));

        this.bigSmallValueLabel.string = betLog.result.number.toString();
        const isBigSymbol = betLog.result.number > 7;
        this.bigSymbol.active = isBigSymbol;
        this.smallSymbol.active = !isBigSymbol;

        this.amountLabel.string = numberWithCommas(betLog.totalAmount, 2);
        this.win.string = numberWithCommas(betLog.betwin, 2);
        this.setBackground(index);
    }

    getSymbolName = (symbol: string) => {
        return symbol === "cup" ? "cup100" : symbol;
    };

    openTicketDetail() {}
}
