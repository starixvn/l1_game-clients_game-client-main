import { i18n } from "../../../../ClientModules";
import GameUtils from "../../../../common/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export class ButtonCopy extends cc.Component {
    @property(cc.Node)
    nodeHintCopy: cc.Node = null;
    public isCopying = false;
    protected lblHint: cc.Label = null;

    onLoad() {
        //super.onLoad();
        if (this.nodeHintCopy) {
            this.lblHint = this.nodeHintCopy.getChildByName("content").getComponent(cc.Label);
            this.lblHint.string = i18n.t("copy_successfully_md5");
        }
        window.addEventListener("message", this.registerEventCopyMD5);
    }

    onDestroy(): void {
        //super.onDestroy();
        window.removeEventListener("message", this.registerEventCopyMD5);
    }

    private readonly registerEventCopyMD5 = (event: MessageEvent) => {
        const success = event.data.copySuccessfully;
        if (success !== undefined && this.isCopying) {
            this.isCopying = false;
            const key = success ? "copy_successfully_md5" : "copy_failed_md5";
            this.lblHint.string = i18n.t(key);
            this.showHint();
        }
    };

    private showHint() {
        if (this.nodeHintCopy) {
            cc.tween(this.nodeHintCopy.opacity).to(0.2, { opacity: 255 }).delay(1.5).to(0.1, { opacity: 1 }).start();
        }
    }

    public hideHint() {
        if (this.nodeHintCopy) {
            this.nodeHintCopy.opacity = 0;
        }
    }

    onClickButton(copyString: string) {
        //GameUtils.copyToClipboard(copyString, this.lblHint, () => this.showHint());
    }
}
