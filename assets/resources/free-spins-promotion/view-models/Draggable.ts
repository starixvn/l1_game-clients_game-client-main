const { ccclass } = cc._decorator;

@ccclass
export default class Draggable extends cc.Component {
    private _touchOffset: cc.Vec2 = null;
    private _touchReference: cc.Vec2 = null;
    public onClickCallback: () => void = null;

    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(e: cc.Event.EventTouch) {
        const touchLoc = e.getLocation();
        const nodePos = this.node.getPosition();
        this._touchOffset = cc.v2(touchLoc.x - nodePos.x, touchLoc.y - nodePos.y);

        // Reference tọa độ gốc để sau này so sánh
        this._touchReference = cc.v2(
            touchLoc.x - (touchLoc.x - nodePos.x),
            touchLoc.y - (touchLoc.y - nodePos.y)
        );
    }

    onTouchMove(e: cc.Event.EventTouch) {
        const touchLoc = e.getLocation();
        const newX = touchLoc.x - this._touchOffset.x;
        const newY = touchLoc.y - this._touchOffset.y;
        this.node.setPosition(this.clampPosition(cc.v2(newX, newY)));
    }

    onTouchEnd(e: cc.Event.EventTouch) {
        const xChanger = this._touchReference.x - (e.getLocationX() - this._touchOffset.x);
        const yChanger = this._touchReference.y - (e.getLocationY() - this._touchOffset.y);

        if (Math.abs(xChanger) < 5 && Math.abs(yChanger) < 5) {
            this.onClickCallback?.();
        } else {
            this.snapToEdge();
        }

        this._touchOffset = null;
        this._touchReference = null;
    }

    clampPosition(pos: cc.Vec2): cc.Vec3 {
        const winSize = cc.winSize;
        const halfW = this.node.width / 2;
        const halfH = this.node.height / 2;

        const minX = -winSize.width / 2 + halfW;
        const maxX = winSize.width / 2 - halfW;
        const minY = -winSize.height / 2 + halfH;
        const maxY = winSize.height / 2 - halfH;

        pos.x = Math.max(minX, Math.min(maxX, pos.x));
        pos.y = Math.max(minY, Math.min(maxY, pos.y));

        return cc.v3(pos.x, pos.y);
    }

    snapToEdge() {
        const winSize = cc.winSize;
        const halfW = this.node.width / 2;
        const halfH = this.node.height / 2;

        const maxX = winSize.width / 2 - halfW;
        const maxY = winSize.height / 2 - halfH;

        const curPos = this.node.getPosition();

        const distLeft = Math.abs(curPos.x + maxX);
        const distRight = Math.abs(maxX - curPos.x);

        const targetX = distLeft < distRight ? -maxX : maxX;
        const targetY = Math.max(-maxY, Math.min(maxY, curPos.y));

        cc.tween(this.node)
            .to(0.15, { x: targetX, y: targetY }, { easing: "sineOut" })
            .start();
    }
}
