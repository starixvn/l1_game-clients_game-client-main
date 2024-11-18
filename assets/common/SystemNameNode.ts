import { SystemType } from "../ISystem";
import configs = require("../configs/Configs");

const { ccclass, property } = cc._decorator;

export enum SystemName {
    SC1 = "SABA.games",
    SC2 = "Vgaming"
}
@ccclass
export default class SystemNameNode extends cc.Component {
    onLoad() {
        let systemName = SystemName.SC1;
        if (configs.systemType === SystemType.SC2) {
            systemName = SystemName.SC2;
        }
        this.node.getComponent(cc.Label).string = systemName;
    }
}
