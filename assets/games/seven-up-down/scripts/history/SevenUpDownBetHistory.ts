import AudioManager from "../../../../common/audio/AudioManager";
import SocketIOGameHistoryBase from "../../../_base/view-models/SocketIOGameHistoryBase";
import SevenUpDownHistoryItem from "./SevenUpDownHistoryItem";
import { getLocale } from "../../../../common/auth/SessionManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownBetHistory extends SocketIOGameHistoryBase {
    public headerTitleColor = "#EDBB02";

    bindItemRowData(betLog, index) {
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(SevenUpDownHistoryItem);
        item.setData(betLog, index);
        this.content.addChild(itemNode);
        item.showTicketDetail = (betLog) => {
            AudioManager.getInstance().playClick();
            this.getBetDetailURL(betLog);
        };
        item.init(this.socket);
    }

    getBetDetailURL(betLog) {
        this.socket?.connected &&
            this.socket.emit("betDetails", {
                roundId: betLog.roundId,
                mode: "dark",
                language: getLocale(),
                timeZoneOffset: -new Date().getTimezoneOffset() / 60
            });
    }
}
