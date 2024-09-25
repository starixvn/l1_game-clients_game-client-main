import { i18n } from "../../../ClientModules";
import AnimationUtils from "../../../common/utils/AnimationUtils";

const { ccclass, property } = cc._decorator;
export interface TResult {
    home: boolean;
    away: boolean;
}

@ccclass
export class FootballCoinTossWinningResult extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    @property(sp.Skeleton)
    skeleton: sp.Skeleton = null;

    @property
    supportChoices = "";

    private get choices() {
        return this.supportChoices.split(",");
    }

    private skinName = "";
    private trackIndex = 0;
    private readonly animName = "settle";
    durationShowResult = 2;

    getSkinName(isBiden: boolean) {
        let name = "trump";
        if (isBiden) {
            name = "biden";
        }

        return name;
    }

    getTrackIndex(isBiden: boolean) {
        let trackIndex = 0;
        if (isBiden) {
            trackIndex = 1;
        }

        return trackIndex;
    }

    hideQuickly() {
        this.node.active = false;
    }

    async show() {
        this.node.active = true;
        return AnimationUtils.playSkinSpine(this.skeleton, this.animName, this.skinName, this.trackIndex, false, this.durationShowResult);
    }

    setResult(data: any) {
        this.skinName = this.getSkinName(data?.home || false);
        this.trackIndex = this.getTrackIndex(data?.home || false);
    }

    setSettlementResult(data: any) {
        const winChoice = this.choices.find((choice) => data[choice]);
        if (winChoice) {
            this.label.string = i18n.t(`${winChoice}_win`);
        }

        return winChoice;
    }

    setSkeletonData(skeletonData: sp.SkeletonData) {
        if (this.skeleton) {
            this.skeleton.skeletonData = skeletonData;
        }
    }
}
