import BetItem from "../../_base/view-models/BetItem";
import Fantan from "./Fantan";
import AudioManager from "../../../common/audio/AudioManager";
const { ccclass, property } = cc._decorator;

@ccclass
export default class FantanBetOptionsUI extends cc.Component {
    @property(cc.Node)
    betContainer: cc.Node = null;

    private main: Fantan;
    private startPosition;
    private readonly SWIPE_MIN_DISTANCE = 10;
    private movingBehavior = false;

    start() {
        // Open the collision manager, without this part statement you will not detect any collision.
        cc.director.getCollisionManager().enabled = true;
        this.node.on(cc.Node.EventType.TOUCH_START, this.eventStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.eventEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.eventEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.eventMove, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.eventStart, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.eventEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.eventEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.eventMove, this);
    }

    eventStart(e: cc.Event.EventTouch) {
        this.startPosition = e.touch.getLocation();
    }

    eventEnd(e: cc.Event.EventTouch) {
        if (this.movingBehavior) {
            this.movingBehavior = false;
            return;
        }

        const distance = this.startPosition.sub(e.touch.getLocation()).mag();
        if (distance <= this.SWIPE_MIN_DISTANCE) {
            this.handleBetItemClick(e);
        }
    }

    eventMove(e: cc.Event.EventTouch) {
        const distance = this.startPosition.sub(e.touch.getLocation()).mag();
        if (distance > this.SWIPE_MIN_DISTANCE) {
            this.movingBehavior = true;
        }
    }

    initBetOptions(main: Fantan) {
        this.main = main;
        const betItems: BetItem[] = [];
        this.betContainer.getComponentsInChildren(BetItem).forEach((betItem) => {
            betItems.push(betItem);
        });
        main.betItems = betItems;
    }

    handleBetItemClick(e: cc.Event.EventTouch) {
        this.main.isBetSound && AudioManager.getInstance().playClick();
        const location = e.getLocation();
        const betItem = this.betContainer.children.find((item) => this.checkCollider(location, item.getComponent(cc.PolygonCollider)));

        if (!betItem) {
            return;
        }

        this.main.handleBetItemClick(betItem.name);
    }

    checkCollider(location: cc.Vec2, collider: cc.PolygonCollider) {
        return cc.Intersection.pointInPolygon(location, collider.world.points);
    }
}
