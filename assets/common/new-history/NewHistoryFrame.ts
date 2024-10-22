import HistoryFrame from "./HistoryFrame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewHistoryFrame extends HistoryFrame {
    private readonly HEIGHT_PAGING = 50;
    updateSizeFrame(widthContent: number, heightContent: number, autoScaleNodeWidth: number) {
        const mainFrameWidth = widthContent + this.PADDING * 2;
        const mainFrameHeight = heightContent + this.PADDING + this.PADDING_TOP_HEIGHT + this.HEIGHT_PAGING;
        this.mainFrame.height = mainFrameHeight;
        this.tableBg.width = widthContent;
        this.tableBg.height = heightContent;
        this.backWrapper.width = mainFrameWidth;

        this.updateAutoScaleByWidth();
    }
}
