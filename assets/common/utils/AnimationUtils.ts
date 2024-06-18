export default class AnimationUtils {

    public static fadeIn = (node: cc.Node, duration: number, opacity = 255) => {
        return this.fadeTo(node, duration, opacity);
    };

    public static fadeOut = (node: cc.Node, duration: number, opacity = 1) => {
        return this.fadeTo(node, duration, opacity);
    };

    public static fadeTo = (node: cc.Node, duration: number, opacity: number) => {
        const uiOpacity = node.opacity;

        return new Promise<void>((resolve) => {
            if (uiOpacity) {
                cc.tween(uiOpacity)
                    .to(duration, { opacity: opacity })
                    .call(() => resolve())
                    .start();
            } else {
                resolve();
            }
        });
    };
    public static playSpine = (spine: sp.Skeleton, animationName: string, isLoop = false, duration?: number) => {
        return new Promise<void>((resolve, reject) => {
            const animation = spine.findAnimation(animationName);
            if (!animation) {
                resolve();
                return;
            }
            const animationDuration = animation.duration;
            if (duration) {
                spine.timeScale = animationDuration / duration;
            } else {
                duration = animationDuration;
            }

            spine.setAnimation(0, animationName, isLoop);

            cc.tween(spine)
                .delay(duration)
                .call(() => resolve())
                .start();
        });
    };

    public static playSkinSpine = (
        spine: sp.Skeleton,
        animationName: string,
        skin: string,
        track = 0,
        isLoop = false,
        duration?: number
    ) => {
        return new Promise<void>((resolve, reject) => {
            const animation = spine.findAnimation(animationName);
            if (!animation) {
                resolve();
                return;
            }
            const animationDuration = animation.duration;
            if (duration) {
                spine.timeScale = animationDuration / duration;
            } else {
                duration = animationDuration;
            }

            spine.setAnimation(track, animationName, isLoop);
            if (skin) {
                spine.setSkin(skin);
            }

            cc.tween(spine)
                .delay(duration)
                .call(() => resolve())
                .start();
        });
    };

    public delayTime = (time: number) => {
        return new Promise<void>((resolve) => {
            cc.tween({})
                .delay(time)
                .call(() => resolve())
                .start();
        });
    };
}
export const isValidNode = (comp: cc.Component) => {
    return comp.node && comp.node.isValid;
};
