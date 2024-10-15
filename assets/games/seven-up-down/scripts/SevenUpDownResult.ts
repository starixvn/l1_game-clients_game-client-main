import axios from "axios";
import { BundleManager } from "bundle-management";

import GameUtils from "../../../common/GameUtils";

const { ccclass, property } = cc._decorator;

interface IResult {
    dice1: number;
    dice2: number;
}

@ccclass
export default class SevenUpDownResult extends cc.Component {
    @property(cc.Sprite)
    diceSprite: cc.Sprite = null;

    @property(sp.Skeleton)
    diceSkeleton: sp.Skeleton = null;

    private diceSprites: any[] = [];

    onLoad() {
        BundleManager.initialize({
            adapters: {
                assetManager: () => cc.assetManager,
                http: () => ({
                    get: (url: string) =>
                        axios
                            .get(url)
                            .then((res) => res.data)
                            .catch((error) => {
                                throw new Error(`BundleManager get ${url}: ${error.message}`);
                            })
                })
            },
            listeners: []
        });
    }

    showResult() {
        this.loadDiceImages();
    }

    async loadAsset(folder: string) {
        const frame = await GameUtils.loadAssetsFromBundle(`103`, `textures/dices/${folder}`, cc.SpriteFrame, null);
        this.diceSprites = this.diceSprites.concat(frame);
        console.log(this.diceSprites);
    }

    private loadDiceImages() {
        const folders = ["start-01", "loop-01", "end-02"];
        folders.forEach((folder) => {
            this.loadAsset(folder);

            // BundleManager.getInstance()
            //     .loadBundle("80")
            //     .then((bundle: cc.AssetManager.Bundle) => {
            //         // bundle.loadDir(preloadPath, () => {
            //         //     bundle.loadDir(path, cc.SpriteFrame, resolve);
            //         // });
            //         const spriteFrame = bundle.load<cc.SpriteFrame>(`textures/dices/${folder}`, cc.SpriteFrame, null);
            //         console.log(spriteFrame);
            //     });

            // const spriteFrame = BundleManager.getInstance().loadAsset<cc.SpriteFrame>({
            //     bundleId: "103",
            //     path: `textures/dices/${folder}`,
            //     type: cc.SpriteFrame
            //     // onComplete: (error: Error, assets: cc.SpriteFrame[]) => {
            //     //     if (!error) {
            //     //         this.diceSprites = this.diceSprites.concat(assets);
            //     //     }
            //     // }
            // });
            // console.log(spriteFrame);
        });
    }

    // private getRandomAnimation(): string {
    //     const animations = this.diceSkeleton.skeletonData.animations;
    //     const randomIndex = Math.floor(Math.random() * animations.length);
    //     return animations[randomIndex].name;
    // }

    // private getRandomBone(): sp.spine.Bone {
    //     const bones = this.diceSkeleton.skeleton.bones;
    //     const randomIndex = Math.floor(Math.random() * bones.length);
    //     return bones[randomIndex];
    // }

    // setResult(result: IResult) {
    //     // Set a random sprite from the loaded sprites
    //     if (this.diceSprites.length > 0) {
    //         const randomIndex = Math.floor(Math.random() * this.diceSprites.length);
    //         this.diceSprite.spriteFrame = this.diceSprites[randomIndex];
    //     }

    //     // Get a random animation name
    //     const randomAnimation = this.getRandomAnimation();
    //     console.log("Random animation:", randomAnimation);

    //     // Get a random bone
    //     const randomBone = this.getRandomBone();
    //     console.log("Random bone:", randomBone.data.name);

    //     // You can use the random animation and bone as needed
    //     // For example, you might want to play the random animation:
    //     // this.diceSkeleton.setAnimation(0, randomAnimation, false);
    // }
}
