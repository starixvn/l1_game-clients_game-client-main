import * as sessionManager from "./auth/SessionManager";
const { ccclass, property } = cc._decorator;

@ccclass
export default class SystemNameNode extends cc.Component {
    private readonly OPERATOR_NAMES = {
        SG: "SABA.games",
        VG: "Vgaming",
        SP: "SABA Play",
        TIP88: ""
    } as const;
    onLoad() {
        const operator = sessionManager.getOperator();
        if (operator === null) {
            return;
        }
        const operatorStr = operator.toUpperCase();
        this.node.getComponent(cc.Label).string = this.OPERATOR_NAMES[operatorStr] || "";
    }
}
