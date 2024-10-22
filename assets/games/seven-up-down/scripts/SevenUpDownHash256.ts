import * as i18n from "i18n/runtime-scripts/LanguageData";

import MD5Component, { MD5Type } from "../../_base/view-models/MD5Component";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownHash256 extends MD5Component {
    maximumStringAllowed = 37;
    setCaptionAndHintForMD5(isMD5Key: boolean) {
        this.md5Text.string = i18n.t(isMD5Key ? "Common.hash_result" : "Common.hash256");
        this.md5Text.node.position = cc.v3(-5, 0, 0);
        cc.tween(this.md5Text.node)
            .to(0.3, { position: cc.v3(0, 0, 0) })
            .start();
    }

    setDataTip(data: MD5Type) {
        this.tipString = data.rawValue || data.hashValue;
    }
}
