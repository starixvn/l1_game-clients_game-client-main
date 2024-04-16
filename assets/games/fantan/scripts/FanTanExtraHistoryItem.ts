import ExtraDataHistoryItem from "../../_base/view-models/ExtraDataHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FanTanExtraHistoryItem extends ExtraDataHistoryItem {
    choiceSpriteName = {
        0: "scoreboard_chamxanhduong",
        1: "scoreboard_chamxanhla",
        2: "scoreboard_chamvang",
        3: "scoreboard_chamdo"
    };
}
