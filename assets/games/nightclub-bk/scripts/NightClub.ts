import HeroesSlot from "../../AHCL/scripts/HeroesSlot";

const { ccclass } = cc._decorator;

export const NightClubId = 46;

@ccclass
export default class NightClub extends HeroesSlot {
    constructor() {
        super();
        this.gameId = NightClubId;
    }
}
