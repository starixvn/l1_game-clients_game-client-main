import MD5Component, { MD5Type } from "../../_base/view-models/MD5Component";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FantanMD5 extends MD5Component {
    maximumStringAllowed = 26;

    setDataTip(data: MD5Type) {
        this.tipString = data.hashValue || data.rawValue;
    }
}
