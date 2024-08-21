import { GameData } from "../_gateway_game/models/game-data";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class RenderItem extends cc.Component {
    abstract init(data: GameData);
    protected onData: (data: any) => void;
}
