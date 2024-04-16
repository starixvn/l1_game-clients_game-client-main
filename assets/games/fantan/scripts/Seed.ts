const { ccclass, property } = cc._decorator;

@ccclass
export default class Seed extends cc.Component {
    Velocity = cc.Vec3.ZERO;
    IsPhysicsEnabled = true;

    static BigBowlSeedPool: Seed[] = [];
    static SmallBowlSeedPool: Seed[] = [];
    static BigBowlSeedSwapIdx = [];
    Radius = 5;

    private readonly decreaseVelocityRate = 0.65;

    get RadiusSQ() {
        return this.Radius * this.Radius;
    }

    static UpdateAllSeeds() {
        for (const seed of [...Seed.BigBowlSeedPool, ...Seed.SmallBowlSeedPool]) {
            if (seed.node.active) {
                seed.PhysicsUpdate();
            }
        }
    }

    static HideSmallBowlSeed() {
        for (const seed of Seed.SmallBowlSeedPool) {
            seed.node.active = false;
        }
    }

    static SwapSeeds(position) {
        if (0 === Seed.BigBowlSeedSwapIdx.length) {
            return;
        }
        const index = Seed.BigBowlSeedSwapIdx.pop(),
            seed = Seed.BigBowlSeedPool[index];
        if (null !== seed) {
            seed.node.position = position;
            seed.node.active = !0;
        }
    }

    PhysicsUpdate() {
        if (this.node.active && this.IsPhysicsEnabled) {
            this.node.position = this.node.position.add(this.Velocity);
            this.Velocity = this.Velocity.mul(this.decreaseVelocityRate);
            for (const seed of [...Seed.BigBowlSeedPool, ...Seed.SmallBowlSeedPool]) {
                if (seed !== this && seed.node.active) {
                    const i = this.node.position.sub(seed.node.position);
                    const a = i.magSqr();
                    if (a < this.RadiusSQ) {
                        const t = Math.sqrt(a),
                            o = i.mul(((2 * this.Radius - t) / t) * 0.125);
                        this.node.position = this.node.position.add(o);
                        seed.node.position = seed.node.position.sub(o);
                    }
                }
            }
        }
    }
}
