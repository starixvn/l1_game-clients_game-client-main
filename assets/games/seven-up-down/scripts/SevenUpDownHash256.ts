import { i18n } from "../../../ClientModules";

import MD5Component, { MD5Type } from "../../_base/view-models/MD5Component";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownHash256 extends MD5Component {
    @property({ visible: false, override: true })
    md5Text: cc.Label = null;

    @property({ visible: false, override: true })
    copyButton: cc.Button = null;

    @property({ visible: false, override: true })
    hintCopyNode: cc.Node = null;

    maximumStringAllowed = 37;
    setCaptionAndHintForMD5(isMD5Key: boolean) {
        this.md5Text.string = i18n.t(isMD5Key ? "Common.result" : "Common.sha256");
        this.md5Text.node.position = cc.v3(-5, 0, 0);
        cc.tween(this.md5Text.node)
            .to(0.3, { position: cc.v3(0, 0, 0) })
            .start();
    }

    setDataTip(data: MD5Type) {
        this.tipString = data.rawValue || data.hashValue;
    }
}
