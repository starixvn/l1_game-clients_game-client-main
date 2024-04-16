import { lodash } from "../../../ClientModules";
import BetChips from "../../../common/bet-chips/view-models/BetChips";
import ChipStack from "../../../common/chip-stack/views/ChipStack";
import GameUtils from "../../../common/GameUtils";
import { userManager } from "../../../common/user/UserManager";
import GameRoomBaseBetHandler from "../../_base/handlers/GameRoomBaseBetHandler";
import WebSocketTableGameBase from "../../_base/WebSocketTableGameBase";
import { updatePreviousBets } from "../../_base_new/actions/BetAction";
import { ChipType } from "../FootballSlotType";
import FootballSlot from "../view-models/FootballSlot";
import FootballSlotChipView from "../view-models/FootballSlotChipView";


export class FootballSlotBetHandler extends GameRoomBaseBetHandler {
    constructor(protected readonly main: FootballSlot) {
        super(main);
    }

    private readonly chipScaleX = 0.3;
    private readonly chipScaleY = 0.22;
    private readonly durationMoveChipDefault = 0.7;

    handle(data: any) {
        if (this.main.isStopGame || this.main.isDisableGame) {
            return;
        }

        if (!this.main.isStopGame && !this.main.isDisableGame) {
            if (data.ownBets) {
                this.main.previousRoundBetChoices = lodash.cloneDeep(data.ownBets);
            }
        }

        if (!lodash.isEmpty(data.totalBets) || !lodash.isEmpty(data.ownBets)) {
            this.main.betItems.forEach((item) => {
                item.setData(data);
            });
        }

        this.handleEndBet(data);

        if (this.main.gameConfigs) {
            this.handleChipInMainRoom(data);
        }

        if (data.ownBets) {
            if (this.main.roundId === -1 && data.roundId) {
                this.main.roundId = data.roundId;
                this.main.loadRebetStorage();
            } else {
                updatePreviousBets(this.main)(data.ownBets);
            }
        }

        if (data.rebet) {
            this.handleRebet(data.rebet);
        }
    }

    handleChipInMainRoom(data: any) {
        const mainRoomGame = this.main as WebSocketTableGameBase;
        if (mainRoomGame && mainRoomGame.enablePlaceChips) {
            if (data.ownChip) {
                this.placeOwnChip(data.ownChip);
            }

            if (data.playerChip) {
                this.handlePlayerChipAction(data);
            }

            if (data.totalBets && data.gameConfigs && data.remainingTime < mainRoomGame.config.betTime) {
                this.placeTotalBets(data.totalBets);
            }
        }
    }

    handleDestPosition(destNode: any, destPosition: any) {
        if (destNode.childrenCount > 0) {
            const stack = destNode.children[0].getComponent(ChipStack);
            if (stack) {
                destPosition = cc.v2(0, stack.getCurrentHeight() * this.chipScaleY);
            }
        }
        return destPosition;
    }

    placeOwnChip(data) {
        this.calculateTotalBetAmount(data.betChoice, +data.amount);
        const startNode = this.main.betChips.getChipNode(data.amount);
        const chipType: ChipType = {
            betAmount: data.amount,
            betChoice: data.betChoice,
            durationMoveChip: 0.7,
            startNode: startNode,
            totalBet: this.main.gameData.totalBetAmount[data.betChoice],
            isOwnBet: true,
            rate: userManager.rate
        };

        this.handleChipStack(chipType);
    }

    placePlayerChip(data) {
        const { betChoice, amount, rate } = data;
        let startNode: cc.Node;
        const playerSlot = this.main.playerHandler.getPlayerSlot(data.playerId);
        if (playerSlot) {
            this.updatePlayerSlotDataStorage(data, playerSlot);
            startNode = playerSlot.avatar.node;
        } else {
            startNode = this.main.otherPlayers;
            this.updateOtherDataStorage(data);
        }
        const convertValue = GameUtils.getValueByCurrency(amount, rate);
        const chipValues = GameUtils.getChipQuantity(convertValue, this.main.betChips?.chipValues);

        const minChipValues = this.main.betChips?.chipValues[0];
        const chipValueConvert = convertValue < minChipValues ? convertValue : convertValue % minChipValues;

        let indexChipValue = 0;
        Object.keys(chipValues).forEach((chipValue) => {
            const quantity = chipValues[chipValue];
            for (let i = 0; i < quantity; i++) {
                const betAmount = +chipValue === 0 ? chipValueConvert : +chipValue;
                const duration = indexChipValue * 0.1 + this.durationMoveChipDefault;
                this.main.node.runAction(
                    cc.sequence(
                        cc.delayTime(duration),
                        cc.callFunc(() =>
                            this.placeOtherPlayerChip({
                                betChoice: betChoice,
                                amount: betAmount,
                                startNode: startNode,
                                durationMoveChip: duration,
                                rate: rate,
                                isChipZero: +chipValue === 0
                            })
                        )
                    )
                );

                indexChipValue++;
            }
        });
        this.playerChips.pop();
    }

    placeOtherPlayerChip(data: {
        betChoice: string;
        amount: number;
        startNode: cc.Node;
        durationMoveChip: number;
        rate: number;
        isChipZero: boolean;
    }) {
        this.calculateTotalBetAmount(data.betChoice, +data.amount);

        const chipType: ChipType = {
            betAmount: data.isChipZero ? 0 : data.amount,
            betChoice: data.betChoice,
            durationMoveChip: data.durationMoveChip,
            startNode: data.startNode,
            totalBet: this.main.gameData.totalBetAmount[data.betChoice],
            isOwnBet: false,
            rate: data.rate
        };

        this.handleChipStack(chipType);
    }

    placeTotalBets(totalBets: any) {
        Object.keys(totalBets).forEach((betChoice) => {
            const betItem = lodash.find(this.main.betItems, (item) => item.node.name.toLowerCase() === betChoice.toLowerCase());
            const totalBetOfChoice = GameUtils.getValueByCurrency(totalBets[betChoice] || 0);
            this.main.gameData.totalBetAmount[betChoice] = totalBetOfChoice;
            this.addChipStack(betItem.chipNode, totalBetOfChoice);
        });
    }

    calculateTotalBetAmount(betChoice: string, amount: number) {
        this.main.gameData.totalBetAmount[betChoice] = +(this.main.gameData.totalBetAmount[betChoice] || 0) + amount;
    }

    handleChipStack(chipStack: ChipType) {
        const { betAmount, betChoice, durationMoveChip, totalBet, startNode, isOwnBet } = chipStack;
        const betItem = lodash.find(this.main.betItems, (item) => item.node.name.toLowerCase() === betChoice.toLowerCase());
        const destNode = betItem.chipNode;
        this.main.betOptionsUI?.playSingleChipsSound(isOwnBet);
        const chipNode = this.main.betChips.createSmallChip(betAmount);
        chipNode.position = destNode.convertToNodeSpaceAR(startNode.convertToWorldSpaceAR(cc.v3(0, 0)));
        destNode.addChild(chipNode);
        let destPosition = cc.v2(0, 0);
        destPosition = this.handleDestPosition(destNode, destPosition);
        const actionMove = isOwnBet
            ? cc.jumpTo(durationMoveChip, destPosition, 150, 1)
            : cc.moveTo(durationMoveChip, destPosition).easing(cc.easeSineOut());
        chipNode.runAction(
            cc.sequence(
                actionMove,
                cc.callFunc(() => {
                    chipNode.destroy();
                    this.addChipStack(destNode, totalBet);
                })
            )
        );
    }

    createChipStackOnBetOption(totalBet: number, betChips: BetChips, skewX: number) {
        const chipValues = GameUtils.getChipQuantity(totalBet, this.main.betChips?.chipValues);
        const node = new cc.Node();
        const chipStack = node.addComponent(ChipStack);
        chipStack.chipSize = 26;
        chipStack.thickness = 18;
        chipStack.skewX = skewX;

        const keys = Object.keys(chipValues).sort((a, b) => +b - +a);
        let firstChip = true;
        keys.forEach((chip) => {
            const count = chipValues[chip];
            for (let i = 0; i < count; i++) {
                let chipNode: cc.Node;
                if (+chip === 0) {
                    chipNode = betChips.createLowValueChip();
                } else {
                    chipNode = betChips.createBigChip(+chip);
                }
                chipStack.addChip(chipNode);

                if (firstChip && i === 0) {
                    firstChip = false;
                    const shadow = new cc.Node();
                    shadow.addComponent(cc.Sprite).spriteFrame = this.main.shadowChip;
                    chipNode.addChild(shadow);
                }
            }
        });
        return node;
    }

    addChipStack(destNode: cc.Node, totalAmount: number) {
        const nameChipStack = "chipStackNode";
        const chipStack = this.createChipStackOnBetOption(totalAmount, this.main.betChips, destNode.skewX);

        chipStack.zIndex = -1;
        chipStack.scaleX = this.chipScaleX;
        chipStack.scaleY = this.chipScaleY;

        chipStack.children.forEach((child) => {
            child.getComponent(FootballSlotChipView)?.applyForSmallChip();
        });
        const oldChipStack = destNode.getChildByName(nameChipStack);
        oldChipStack && destNode.removeChild(oldChipStack);
        oldChipStack?.destroy();
        destNode.addChild(chipStack, -1, nameChipStack);
    }
}


