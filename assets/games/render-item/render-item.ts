import EventEmitterBase from "../../common/emitter/EventEmitterBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class RenderItem extends cc.Component {
    abstract init(data: EventEmitterBase);
    abstract onData(data: any): void;
}
