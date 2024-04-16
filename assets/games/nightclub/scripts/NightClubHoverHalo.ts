const { ccclass, property } = cc._decorator;

@ccclass
export default class NightClubHoverHalo extends cc.Component {
    @property(cc.Node)
    haloEffect: cc.Node = null;

    onEnable() {
        this.node.on(cc.Node.EventType.MOUSE_ENTER, this.eventOnHover, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.eventOffHover, this);
    }
    onDisable() {
        this.node.off(cc.Node.EventType.MOUSE_ENTER, this.eventOnHover, this);
        this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.eventOffHover, this);
    }

    eventOnHover() {
        this.haloEffect.active = true;
    }

    eventOffHover() {
        this.haloEffect.active = false;
    }
}
