import { lodash } from "../../../ClientModules";
import AudioManager from "../../../common/audio/AudioManager";
import GameUtils from "../../../common/GameUtils";
import Seed from "./Seed";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FantanBowlAnimation extends cc.Component {
    @property(cc.Prefab)
    seedPreab: cc.Prefab = null;

    @property(cc.Node)
    seedContainer: cc.Node = null;

    @property(sp.Skeleton)
    bowlSpine: sp.Skeleton = null;

    @property({ type: cc.SpriteFrame })
    resultSpriteFrames: cc.SpriteFrame[] = [];

    @property(cc.Node)
    groupSeedsContainer: cc.Node = null;

    @property(cc.Sprite)
    resultNumber: cc.Sprite = null;

    @property(cc.Node)
    bigBowlOriginalNode: cc.Node = null;

    @property(cc.AudioClip)
    beadsColumnSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    beadsMassSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    shakeSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    openBowlSound: cc.AudioClip = null;

    rootNode: cc.Node = null;

    private readonly diplayedSeeds = [];
    private readonly seedGroups = [];
    private readonly remainingSeeds = [];
    bigBowlBone: sp.spine.Bone = null;
    smallBowlBone: sp.spine.Bone = null;
    prevBigBowlPos: cc.Vec3;
    prevSmallBowlPos = cc.Vec3.ZERO;
    finalBead = 0;
    isPlayingAnimation = false;
    animationElapsedTime = 0;

    arcStartAngle = 1.25 * Math.PI;
    arcAngle = 0.5 * Math.PI;

    private readonly ArcRadius = 450;
    private readonly SmallBowlToArcDistance = 160;
    private readonly SeedGroupArcPosY = 150;

    private readonly BigBowlSeedNumbers = 100;
    private readonly seedAccelerator = 0.5;
    private readonly animationShakingName = "shakingBeads";
    private readonly animationOpenName = "openBowl";

    get nodeScale() {
        if (this.rootNode) {
            return this.rootNode.scale * this.node.scale;
        }
        return this.node.scale;
    }

    private get BigBowlRandomWidth() {
        return this.nodeScale * 50;
    }

    private get BigBowlInnerRadius() {
        return this.nodeScale * 48;
    }

    private get BigBowlRadius() {
        return this.nodeScale * 88;
    }

    private get SmallBowlRadius() {
        return this.nodeScale * 45;
    }

    private get SmallBowlInnerRadius() {
        return this.nodeScale * 38;
    }

    public showStaticResult(numbersOfSeed) {
        this.pauseSpineAnimation(this.bowlSpine, 0.99, this.animationOpenName);

        const animated = false;
        this.generateResultSeeds(numbersOfSeed);
        this.moveSeedsToArc(animated);
        this.groupingSeeds(animated);
    }

    public async closeRound() {
        await this.showResultAnimation(this.finalBead);
    }

    public setNumberOfSeed(value: number) {
        this.finalBead = value;
    }

    onLoad() {
        this.bigBowlBone = this.bowlSpine.findBone("bigBowl");
        this.smallBowlBone = this.bowlSpine.findBone("smallBowl");
    }

    start() {
        this.initNewSeeds();
        this.pauseSpineAnimation(this.bowlSpine, 0, this.animationOpenName);
        this.bowlSpine.clearTracks();
    }

    onDestroy() {
        Seed.BigBowlSeedPool = [];
        Seed.BigBowlSeedSwapIdx = [];
        Seed.SmallBowlSeedPool = [];
    }

    update(dt: number) {
        this.updateAnimation(dt);
        Seed.UpdateAllSeeds();
    }

    initNewSeeds() {
        if (this.bowlSpine) {
            this.bowlSpine.updateWorldTransform();

            this.prevBigBowlPos = this.bowlSpine.node.convertToWorldSpaceAR(cc.v3(this.bigBowlBone.worldX, this.bigBowlBone.worldY));
            this.prevSmallBowlPos = this.bowlSpine.node.convertToWorldSpaceAR(cc.v3(this.smallBowlBone.worldX, this.smallBowlBone.worldY));
            if (0 === Seed.BigBowlSeedPool.length) {
                for (let e = 0; e < this.BigBowlSeedNumbers; e++) {
                    const seedNode = cc.instantiate(this.seedPreab);
                    this.seedContainer.addChild(seedNode);
                    Seed.BigBowlSeedPool.push(seedNode.getComponent(Seed));
                }
            }

            const r = cc.v3(184, -64);
            for (const seed of Seed.BigBowlSeedPool) {
                seed.Velocity = cc.Vec3.ZERO;
                seed.node.position = cc.v3(
                    r.x + this.BigBowlRandomWidth * (lodash.random(true) - 0.5),
                    r.y + this.BigBowlRandomWidth * (lodash.random(true) - 0.5)
                );
                seed.node.active = true;
            }
        }
    }

    async playShakingAnimation(animated = true) {
        this.isPlayingAnimation = animated;
        if (this.seedGroups.length > 0 || this.remainingSeeds.length > 0) {
            this.ClearSeedGrouping(!animated);
        }
        if (!animated) {
            this.pauseSpineAnimation(this.bowlSpine, 0, this.animationOpenName);
            Seed.HideSmallBowlSeed();
        } else {
            this.bowlSpine.setAnimation(0, this.animationShakingName, false);
            this.bowlSpine.timeScale = 1;
            this.animationElapsedTime = 0;
        }

        this.bowlSpine.updateWorldTransform();
        this.prevBigBowlPos = this.bowlSpine.node.convertToWorldSpaceAR(cc.v3(this.bigBowlBone.worldX, this.bigBowlBone.worldY));
        this.prevSmallBowlPos = this.bowlSpine.node.convertToWorldSpaceAR(cc.v3(this.smallBowlBone.worldX, this.smallBowlBone.worldY));

        try {
            if (animated) {
                await GameUtils.delayTime(1);
                this.playShakeBowlSound();
                await GameUtils.delayTime(4.9);
            }
            this.initNewSeeds();
        } catch (e) {
            console.warn(e.message);
        }
    }

    updateAnimation(dt: number) {
        if (this.isPlayingAnimation) {
            const t = this.animationElapsedTime;
            this.animationElapsedTime += dt;
            this.bowlSpine.updateWorldTransform();
            const bigBowlWPos = this.bowlSpine.node.convertToWorldSpaceAR(cc.v3(this.bigBowlBone.worldX, this.bigBowlBone.worldY)),
                smallBowlWPos = this.bowlSpine.node.convertToWorldSpaceAR(cc.v3(this.smallBowlBone.worldX, this.smallBowlBone.worldY));
            if (this.animationElapsedTime < 4.4 || (this.animationElapsedTime > 5.1 && this.animationElapsedTime < 5.8)) {
                this.handleBigBowlMove(bigBowlWPos, bigBowlWPos.sub(this.prevBigBowlPos), this.BigBowlInnerRadius, this.BigBowlRadius);
            }
            this.checkTimeStamp(5, this.animationElapsedTime, t) && this.handleSmallBowlRemove(smallBowlWPos, this.SmallBowlInnerRadius);
            this.animationElapsedTime > 5.5 && this.handleSmallBowlMove(smallBowlWPos, this.SmallBowlRadius);
            this.checkTimeStamp(7.5, this.animationElapsedTime, t) && (this.isPlayingAnimation = false);
            this.prevBigBowlPos = bigBowlWPos;
            this.prevSmallBowlPos = smallBowlWPos;
        }
    }

    handleBigBowlMove(bigBowlWPos: cc.Vec3, deltaPos: cc.Vec3, smallRadius: number, bigRadius: number) {
        const bigBowlInSeedRootPos = this.seedContainer.convertToNodeSpaceAR(bigBowlWPos);
        const smallRadiusSqr = smallRadius * smallRadius;
        const bigRadiusSqr = bigRadius * bigRadius;
        for (const seed of Seed.BigBowlSeedPool) {
            const uPos = seed.node.convertToWorldSpaceAR(cc.v3());
            if (seed.node.active) {
                let distanceVec = bigBowlWPos.sub(uPos);
                const distanceSqr = distanceVec.magSqr();
                if (distanceSqr < bigRadiusSqr) {
                    seed.Velocity = seed.Velocity.add(deltaPos.mul(this.seedAccelerator));
                    if (distanceSqr > smallRadiusSqr) {
                        const distance = Math.sqrt(distanceSqr);
                        distanceVec = distanceVec.mul(smallRadius / distance);
                        const newUPos = bigBowlInSeedRootPos.sub(distanceVec);
                        seed.node.position = newUPos;
                        seed.Velocity = seed.Velocity.add(distanceVec.mul(0.2));
                    }
                }
            }
        }

        for (const seed of Seed.SmallBowlSeedPool) {
            const uPos = seed.node.convertToWorldSpaceAR(cc.v3());
            const d = bigBowlWPos.sub(uPos);
            const p = d.magSqr();
            this.handleBigBowlMoveForSmallBowlSeed(seed, p, smallRadiusSqr, deltaPos, bigBowlInSeedRootPos);
        }
    }

    handleBigBowlMoveForSmallBowlSeed(seed: Seed, p: number, smallRadiusSqr: number, deltaPos: cc.Vec3, bigBowlInSeedRootPos: cc.Vec3) {
        if (seed.node.active) {
            if (p < smallRadiusSqr) {
                seed.Velocity = seed.Velocity.add(deltaPos.mul(this.seedAccelerator));
            } else {
                if (seed.Velocity.x < 0 && deltaPos.x >= 0) {
                    seed.Velocity = cc.Vec3.ZERO;
                    seed.node.active = false;
                    Seed.SwapSeeds(bigBowlInSeedRootPos);
                }
            }
        }
        if (0 !== seed.Velocity.magSqr() && p >= smallRadiusSqr) {
            seed.Velocity = cc.Vec3.ZERO;
            seed.node.active = false;
            Seed.SwapSeeds(bigBowlInSeedRootPos);
        }
    }

    handleSmallBowlRemove(smallBowlWPos, radius) {
        const radiusSqr = radius * radius;
        for (let r = 0; r < Seed.BigBowlSeedPool.length; r++) {
            const i = Seed.BigBowlSeedPool[r];
            const iWpos = i.node.convertToWorldSpaceAR(cc.v3());
            const eSqr = smallBowlWPos.sub(iWpos).magSqr();
            if (i.node.active && eSqr < radiusSqr) {
                Seed.BigBowlSeedSwapIdx.push(r);
                i.node.active = false;
            }
        }

        for (const seed of Seed.SmallBowlSeedPool) {
            const iWpos = seed.node.convertToWorldSpaceAR(cc.v3());
            const eSqr = smallBowlWPos.sub(iWpos).magSqr();
            if (seed.node.active && eSqr < radiusSqr) {
                seed.node.active = false;
            }
        }
    }

    handleSmallBowlMove(smallBowlWPos, smallBowlRadius) {
        const radiusSqr = smallBowlRadius * smallBowlRadius;
        const smallBowlInSeedRootPos = this.seedContainer.convertToNodeSpaceAR(smallBowlWPos);
        for (const seed of [...Seed.BigBowlSeedPool, ...Seed.SmallBowlSeedPool]) {
            if (seed.node.active) {
                const aWpos = seed.node.convertToWorldSpaceAR(cc.v3());
                let s = smallBowlWPos.sub(aWpos);
                const c = s.magSqr();
                if (c < radiusSqr) {
                    const i = Math.sqrt(c);
                    s = s.mul(smallBowlRadius / i);
                    seed.node.position = smallBowlInSeedRootPos.sub(s);
                }
            }
        }
    }

    checkTimeStamp(e: number, t: number, n: number) {
        return t >= e && n < e;
    }

    async showResultAnimation(numbersOfSeed) {
        if (!this.diplayedSeeds) {
            return;
        }

        AudioManager.getInstance().playSFX(this.openBowlSound);

        this.pauseSpineAnimation(this.bowlSpine, 0.99);
        this.bowlSpine.update(0.01);
        this.smallBowlBone.update();
        this.prevSmallBowlPos = this.bowlSpine.node.convertToWorldSpaceAR(cc.v3(this.smallBowlBone.worldX, this.smallBowlBone.worldY));
        this.bowlSpine.node.active = true;
        this.bowlSpine.setAnimation(0, this.animationOpenName, false);
        this.bowlSpine.timeScale = 1;
        try {
            await GameUtils.delayTime(100 / 1e3);
            this.generateResultSeeds(numbersOfSeed);
            const n = 1e3 * this.bowlSpine.findAnimation(this.animationOpenName).duration;

            await GameUtils.delayTime(n / 1e3);
            this.moveSeedsToArc();

            const delay = 500 + 10 * this.diplayedSeeds.length;
            await GameUtils.delayTime(delay / 1e3);
            await this.groupingSeeds();
        } catch (e) {
            console.warn(e.message);
        }
    }

    generateResultSeeds(numbersOfSeed) {
        if (!this.diplayedSeeds) {
            return;
        }
        const t = this.seedContainer.convertToNodeSpaceAR(this.prevSmallBowlPos),
            n = Seed.SmallBowlSeedPool.length;
        let r;
        if (n < numbersOfSeed) {
            for (r = 0; r < numbersOfSeed - n; ++r) {
                const i = cc.instantiate(this.seedPreab);
                i.parent = this.seedContainer;
                Seed.SmallBowlSeedPool.push(i.getComponent(Seed));
            }
        }

        for (r = 0; r < numbersOfSeed; r++) {
            const i = Seed.SmallBowlSeedPool[r];
            i.node.position = cc.v3(t.x + 10 * lodash.random(true) - 5, t.y + 10 * lodash.random(true) - 5);
            i.node.active = true;
            this.diplayedSeeds.push(i);
            i.node.stopAllActions();
        }
    }

    moveSeedsToArc(animated = true) {
        if (!this.diplayedSeeds) {
            return;
        }

        animated && this.playBeadsMassSound();
        for (let e = 1.1 * Math.PI, t = (0.2 * Math.PI) / this.diplayedSeeds.length, n = 0; n < this.diplayedSeeds.length; n++) {
            const o = this.diplayedSeeds[n];
            o.IsPhysicsEnabled = false;
            const i = e - t * n,
                a = this.ArcRadius + 15 * lodash.random(true),
                s = Math.sin(i) * a,
                c = Math.cos(i) * a + this.SmallBowlToArcDistance;
            if (animated) {
                this.MoveTo(o.node, s, c, 300, cc.easeQuadraticActionIn(), 10 * n, true);
            } else {
                o.node.position = cc.v3(s, c);
            }
        }
    }

    playBeadsColumnSound() {
        AudioManager.getInstance().playSFX(this.beadsColumnSound);
    }

    playShakeBowlSound() {
        AudioManager.getInstance().playSFX(this.shakeSound);
    }

    playBeadsMassSound() {
        AudioManager.getInstance().playSFX(this.beadsMassSound);
    }

    groupingSeeds(animated = true) {
        return new Promise<void>((resolve, reject) => {
            if (!this.diplayedSeeds) {
                reject("diplayedSeeds null");
                return;
            }

            this.diplayedSeeds.reverse();
            let e = Math.floor(this.diplayedSeeds.length / 4);
            e = this.diplayedSeeds.length % 4 === 0 ? e - 1 : e;
            let delay = 0,
                o = 0;

            let moveSeedToColumn = (s, x, y) => {
                this.MoveTo(s.node, x, y, 150, cc.easeQuadraticActionIn(), delay, true);
            };
            let moveResultSeed = (s, x, y) => {
                this.MoveTo(s.node, x, y, 200, cc.easeQuadraticActionIn(), delay, true);
            };

            if (!animated) {
                moveSeedToColumn = (s, x, y) => {
                    s.node.position = cc.v3(x, y);
                };

                moveResultSeed = (s, x, y) => {
                    s.node.position = cc.v3(x, y);
                };
            }

            for (let t = this.arcAngle / (e - 1); o < e; ++o) {
                const r = [];
                const i = this.arcStartAngle - t * o;
                for (let a = 0; a < 4; ++a) {
                    const s = this.diplayedSeeds.pop();
                    if (0 === a) {
                        s.node.runAction(
                            cc.sequence(
                                cc.delayTime(delay / 1e3),
                                cc.callFunc(() => animated && this.playBeadsColumnSound())
                            )
                        );
                    }
                    const c = this.SeedGroupArcPosY + 15 * a,
                        l = Math.sin(i) * c * 1.2,
                        u = Math.cos(i) * c;
                    const x = l + (2 * lodash.random(true) - 1);
                    const y = u + (1 * lodash.random(true) - 1);
                    moveSeedToColumn(s, x, y);
                    r.push(s);
                }
                this.seedGroups.push(r);
                delay += 230;
            }
            const d = [0, this.groupSeedsContainer.y],
                p = this.diplayedSeeds.length,
                h = 20 * (p - 1),
                delayTime = delay / 1e3;
            for (o = 0; o < p; ++o) {
                const s = this.diplayedSeeds.pop();
                const x = d[0] + 40 * o - h;
                const y = d[1];
                moveResultSeed(s, x, y);
                delay += 100;
                this.remainingSeeds.push(s);
            }
            this.setResultNumberSprite(p);
            if (animated) {
                this.groupSeedsContainer.opacity = 0;
                const spawn = cc.spawn(cc.callFunc(resolve), cc.fadeIn(0.5));
                const resultNumberAction = cc.sequence(cc.delayTime(delayTime), spawn);

                this.groupSeedsContainer.stopAllActions();
                this.groupSeedsContainer.runAction(resultNumberAction);
            } else {
                this.groupSeedsContainer.opacity = 255;
                resolve();
            }
        });
    }

    ClearSeedGrouping(noAnimated = false) {
        const n = this.seedGroups.length;
        for (let t = this.remainingSeeds.length, o = 0; o < t; ++o) {
            this.remainingSeeds[o].IsPhysicsEnabled = true;
        }
        this.remainingSeeds.length = 0;
        for (let o = 0; o < n; ++o) {
            const r = this.seedGroups[o];
            for (let i = 0; i < 4; ++i) {
                r[i].IsPhysicsEnabled = true;
            }
            r.length = 0;
        }
        this.seedGroups.length = 0;
        if (noAnimated) {
            this.groupSeedsContainer.active = false;
        } else {
            this.FadeOut(this.groupSeedsContainer, 200, 0, true);
        }
    }

    ResetBigBowlSeeds() {
        for (const seed of Seed.BigBowlSeedPool) {
            if (seed.node.active) {
                const r = this.prevBigBowlPos.sub(seed.node.convertToNodeSpaceAR(cc.v3(0))).magSqr(),
                    i = this.seedContainer.convertToNodeSpaceAR(this.prevBigBowlPos);
                if (r > this.BigBowlRandomWidth) {
                    seed.Velocity = cc.Vec3.ZERO;
                    seed.node.position = cc.v3(
                        i.x + this.BigBowlRandomWidth * (lodash.random(true) - 0.5),
                        i.y + this.BigBowlRandomWidth * (lodash.random(true) - 0.5)
                    );
                }
            }
        }
    }

    setResultNumberSprite(resultNumber: number) {
        this.resultNumber.node.active = true;
        this.resultNumber.spriteFrame = this.resultSpriteFrames[resultNumber - 1];
    }

    startRound() {
        this.ResetBigBowlSeeds();
    }

    pauseSpineAnimation(spineAnimation: sp.Skeleton, startProgress: number, animationName = this.animationShakingName) {
        spineAnimation.node.active = true;
        spineAnimation.timeScale = 0;
        spineAnimation.setAnimation(0, animationName, false);
        const trackEntry = spineAnimation.getCurrent(0);
        trackEntry.animationStart = trackEntry.animationEnd * startProgress;
    }

    MoveTo(node: cc.Node, x: number, y: number, duration: number, easing, delay = 0, a = true) {
        if (!a) {
            node.position = cc.v3(x, y);
            return;
        }
        const s = cc.moveTo(duration / 1e3, x, y).easing(easing);
        node.runAction(cc.sequence(cc.delayTime(delay / 1e3), s));
    }

    FadeOut(node: cc.Node, duration = 300, delayTime = 0, animated = true) {
        if (!animated) {
            node.active = false;
            node.opacity = 0;
            return;
        }
        node.active = true;
        const r = cc.fadeOut(duration / 1e3);
        node.runAction(cc.sequence(cc.delayTime(delayTime / 1e3), r));
    }
}
