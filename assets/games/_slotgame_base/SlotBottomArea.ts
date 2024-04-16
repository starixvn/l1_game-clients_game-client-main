import ChangeNodeColor from "../../common/ChangeNodeColor";

const { ccclass, property } = cc._decorator;

interface BottomAreaDefinedColor {
    textColor: string;
    numberColor: string;
    buttonBorderColor: string;
    winAmountColor: string;
}

@ccclass
export default class SlotBottomArea extends cc.Component {
    @property(cc.Toggle)
    autoSpinToggle: cc.Toggle = null;

    @property(cc.Toggle)
    turboToggle: cc.Toggle = null;

    @property(cc.Button)
    stakeButton: cc.Button = null;

    @property(cc.ToggleContainer)
    stakeContainer: cc.ToggleContainer = null;

    @property(cc.Button)
    lineButton: cc.Button = null;

    @property(cc.Label)
    stakeLabel: cc.Label = null;

    @property(cc.Label)
    lineLabel: cc.Label = null;

    @property(cc.Label)
    totalBet: cc.Label = null;

    @property(cc.Label)
    winningBet: cc.Label = null;

    @property(cc.Node)
    winningBetEffect: cc.Node = null;

    onClickListener = {
        onStakeButtonClick: () => {},
        onLineSelectionClick: () => {},
        onAutoSpinChanged: () => {},
        onHideStakeContainer: () => {},
        onTurboModeChanged: (toggle) => {},
        onStakeQuickChange: (event) => {},
        onStakeToggleChanged: (event, param) => {}
    };

    onStakeButtonClick() {
        this.onClickListener.onStakeButtonClick();
    }

    onLineSelectionClick() {
        this.onClickListener.onLineSelectionClick();
    }

    onAutoSpinChanged() {
        this.onClickListener.onAutoSpinChanged();
    }

    onTurboModeChanged(toggle: cc.Toggle) {
        this.onClickListener.onTurboModeChanged(toggle);
    }

    onStakeQuickChange(event: cc.Event) {
        this.onClickListener.onStakeQuickChange(event);
    }

    onStakeToggleChanged(event: cc.Event, param: string) {
        this.onClickListener.onStakeToggleChanged(event, param);
    }

    onHideStakeContainer() {
        this.onClickListener.onHideStakeContainer();
    }

    updateColor(colorList: BottomAreaDefinedColor) {
        const { textColor, numberColor, buttonBorderColor, winAmountColor } = colorList;

        this.getComponentsInChildren(ChangeNodeColor).forEach((comp) => {
            const labelComp = comp.node.getComponent(cc.Label);
            if (labelComp) {
                comp.updateColor(comp.node.getComponent("LocalizedLabel") ? textColor : numberColor);
            } else {
                comp.updateColor(buttonBorderColor);
            }
        });

        this.winningBet.node.color = cc.Color.WHITE.fromHEX(winAmountColor);
    }
}
