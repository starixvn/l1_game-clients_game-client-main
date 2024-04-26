import { lodash } from "../../../ClientModules";
import FootballSlotTimeHandler from "../event-handlers/FootballSlotTimeHandler";
import { FootballSlotRoundHistory } from "../event-models/FootballSlotRoundHistory";
import FootballSlot from "../view-models/FootballSlot";
import FootballSlotBetItem from "../view-models/FootballSlotBetItem";
import FootballSlotBetOptionsUI from "../view-models/FootballSlotBetOptionsUI";
import FootballSlotLedLightItem from "../view-models/FootballSlotLedLightItem";

export const getWinningOption = (choice: string) => {
    const tmp = {
        cup: ["cup", "cup50", "cup25"],
        ball: ["ball", "ball3"],
        tickets: ["tickets", "tickets3"],
        mascot: ["mascot", "mascot3"],
        shoes: ["shoes", "shoes3"],
        franceShirt: ["franceShirt", "franceShirt3"],
        englandShirt: ["englandShirt", "englandShirt3"],
        hostCountry: ["hostCountry", "hostCountry3"],
        big: ["big"],
        small: ["small"]
    };
    let result = "";
    Object.keys(tmp).forEach((key) => {
        if (tmp[key].includes(choice)) {
            result = key;
        }
    });
    return result;
};

const executeAnim = async (duration: number, from: number, to: number, numberOfSymbols: number, highlightItem: any) => {
    let currentIndex: number = from;

    return new Promise((resolve) => {
        cc.tween({ value: from })
            .to(
                duration,
                { value: to },
                {
                    easing: "quadOut",
                    onUpdate: (target: { value: number }) => {
                        const nextIndex = Math.round(target.value);

                        if (currentIndex <= nextIndex) {
                            let index = currentIndex;

                            currentIndex = nextIndex;

                            for (; index < nextIndex; index++) {
                                const highlightPosition = index % numberOfSymbols;
                                highlightItem?.[highlightPosition].setHighlightItems(true, false);
                                highlightItem?.[highlightPosition].playSpinSound();
                            }
                        }
                    }
                }
            )
            .call(() => resolve(0))
            .start();
    });
};

export const setBgVisibility = (node: cc.Node, visible: boolean, animated = true) => {
    if (animated) {
        cc.tween(node)
            .to(0.3, { opacity: visible ? 255 : 0 })
            .start();
    } else {
        node.opacity = visible ? 255 : 0;
    }
};

export const formatBigSmallResult = (result: number) => {
    return result < 10 ? "0" + result.toString() : result.toString();
};

export const randomNumberAnimation = (betOptionsUI: FootballSlotBetOptionsUI) => (timeDuration: number) => {
    let currentIndex = 0;
    const arr = Array.from({ length: 100 }, () => lodash.random(1, 14));
    cc.tween({ itemIndex: 0 })
        .to(
            timeDuration,
            { itemIndex: 39 },
            {
                easing: "quadOut",
                onUpdate: (target) => {
                    const node = Math.round(target.itemIndex);
                    if (currentIndex !== node) {
                        currentIndex = node;

                        const numberText = formatBigSmallResult(arr[currentIndex]);
                        betOptionsUI.setBigSmallResult(numberText);
                    }
                }
            }
        )
        .start();
};

export const highlightBigSmallWinning = (betOptionsUI: FootballSlotBetOptionsUI) => (finish: any) => {
    const bigSmallWining = finish.result.bigSmall.choice;
    cc.tween(betOptionsUI?.betItems)
        .call(() => {
            betOptionsUI?.betItems?.forEach((betItem: FootballSlotBetItem) => {
                const nodeName = betItem.node.name;
                if (nodeName === bigSmallWining) {
                    betItem.node.opacity = 255;
                    betItem.setHighlight(true, true);
                }
            });
        })
        .start();
};

export const highlightWinningChoice = (betOptionsUI: FootballSlotBetOptionsUI) => (finish: any) => {
    const choiceWining = getWinningOption(finish.result.symbols[0]);
    cc.tween(betOptionsUI?.betItems)
        .call(() => {
            betOptionsUI?.betItems?.forEach((betItem: FootballSlotBetItem) => {
                const nodeName = betItem.node.name;
                if (nodeName === choiceWining) {
                    betItem.node.opacity = 255;
                    betItem.setHighlight(true, true);
                }
            });
        })
        .start();
};

export const highlightWinningSymbol =
    (betOptionsUI: FootballSlotBetOptionsUI) =>
    (symbols: string, isAnimated = true) => {
        betOptionsUI?.betItems?.forEach((betItem: FootballSlotBetItem) => {
            const nodeName = betItem.node.name;
            if (nodeName === symbols) {
                betItem.node.opacity = 255;
                betItem.setHighlight(true, isAnimated);
            }
        });
    };

export const playLedLightAnimation = async (betOptionsUI: FootballSlotBetOptionsUI) => {
    let currentIndex = 0;
    const timeDuration = 6.5;
    const numberOfSymbols = 40;
    const steps = numberOfSymbols * 5;
    betOptionsUI?.updateBigSmallResultBackground(255);
    cc.tween({ value: 0 })
        .to(
            timeDuration,
            { value: steps },
            {
                easing: "quadOut",
                onUpdate: (target: { value: number }) => {
                    const nextIndex = Math.round(target.value);

                    if (currentIndex <= nextIndex) {
                        let index = currentIndex;

                        currentIndex = nextIndex;

                        for (; index < nextIndex; index++) {
                            const position = index % numberOfSymbols;
                            if (betOptionsUI?.ledZone) {
                                betOptionsUI?.ledZone.children[position].getComponent(FootballSlotLedLightItem)?.setHighlightItems();
                            }
                        }
                    }
                }
            }
        )
        .start();
};

export const spinItemAnimation = (game: FootballSlot) => async (finish: any, timeDuration: number) => {
    const numberOfSymbols = game.betOptionsUI.spinItems.length;
    const symbolPositions = finish.result.symbolPositions;
    const firstPosition = symbolPositions[0];
    const steps = firstPosition + numberOfSymbols * 4;
    const firstSpinTimeDuration = 6.5;

    setBgVisibility(game.betOptionsUI.bgLockSpin, false);
    game.betOptionsUI?.betItems?.forEach((betItem: FootballSlotBetItem) => {
        betItem.node.opacity = 150;
    });

    if (game.betOptionsUI?.spinItems && game.betOptionsUI?.spinItems[firstPosition]) {
        if (!finish.result.isLucky) {
            await executeAnim(firstSpinTimeDuration, 0, steps, numberOfSymbols, game.betOptionsUI.spinItems);
            game.betOptionsUI?.spinItems?.[firstPosition].playSpineSymbolAnimation();
            game.betOptionsUI?.playWinSound();
            highlightWinningChoice(game.betOptionsUI)(finish);
        } else {
            await executeAnim(firstSpinTimeDuration, 0, steps, numberOfSymbols, game.betOptionsUI.spinItems);
            game.betOptionsUI?.spinItems?.[firstPosition].playSpineSymbolAnimation();
            game.betOptionsUI?.playWinLuckySound();

            for (let i = 0; i < symbolPositions.length - 1; i++) {
                const totalSteps = (symbolPositions[i + 1] - symbolPositions[i] + numberOfSymbols) % numberOfSymbols;
                const nextPosition = symbolPositions[i] + totalSteps + 48;
                const winSymbol = getWinningOption(finish.result.symbols[i]);

                await executeAnim(4, symbolPositions[i], nextPosition, numberOfSymbols, game.betOptionsUI?.spinItems);
                game.betOptionsUI?.spinItems?.[symbolPositions[i + 1]].playSpineSymbolAnimation();
                game.betOptionsUI?.playWinSound();
                highlightWinningSymbol(game.betOptionsUI)(winSymbol);
            }
        }
    }
    game?.gameData && game.gameData.settlement.finishShowResult(finish, true);
};

export const showHighlightBet =
    (betOptionsUI: FootballSlotBetOptionsUI) =>
    (resultData: any, isAnimated = true) => {
        const listSymbolWin = resultData.symbols;
        const bigSmallWin = resultData.number > 7 ? "big" : "small";
        highlightWinningSymbol(betOptionsUI)(bigSmallWin, isAnimated);

        for (let i = 0; i <= listSymbolWin.length; i++) {
            const winSymbol = getWinningOption(listSymbolWin[i]);
            highlightWinningSymbol(betOptionsUI)(winSymbol, isAnimated);
        }
    };

export const updateWinning =
    (betOptionUI: FootballSlotBetOptionsUI, timeHandler: FootballSlotTimeHandler) => (roundHistory: FootballSlotRoundHistory[]) => {
        const lastRound = roundHistory[0];
        if (timeHandler.isInRoundTime) {
            showHighlightBet(betOptionUI)(lastRound.result, false);
        }
    };
