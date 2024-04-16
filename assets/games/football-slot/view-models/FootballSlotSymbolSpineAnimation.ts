const { ccclass, property } = cc._decorator;
enum SymbolAnimationType {
    IDLE = "item_idle",
    PLAY = "item_play"
}

@ccclass
export default class FootballSlotSymbolSpineAnimation extends cc.Component {
    @property(sp.Skeleton)
    animSkeleton: sp.Skeleton[] = [];

    @property(cc.Node)
    winSymbolHighlight: cc.Node = null;

    playAnimSymbol(play: boolean) {
        const anim = play ? SymbolAnimationType.PLAY : SymbolAnimationType.IDLE;
        for (const animSymbol of this.animSkeleton) {
            animSymbol.setAnimation(0, anim, true);
        }
    }

    highlightSymbol(highlight: boolean) {
        if (this.winSymbolHighlight) {
            this.winSymbolHighlight.active = highlight ? true : false;
            cc.tween(this.winSymbolHighlight)
                .repeatForever(cc.tween().to(0.3, { opacity: 255 }).to(0.3, { opacity: 0 }))
                .start();
        }
    }
}
