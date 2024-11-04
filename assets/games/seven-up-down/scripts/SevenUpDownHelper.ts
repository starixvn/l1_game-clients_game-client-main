import { i18n } from "../../../ClientModules";
import { ISevenUpDownResult, SevenUpDownChoice } from "./SevenUpDownTypes";

export const findWinningChoice = (settlementResult: any): string => {
    return Object.keys(settlementResult).find((key) => settlementResult[key] === true);
};

export const determineWinningChoice = (totalPoints: number): string => {
    if (totalPoints === 7) {
        return SevenUpDownChoice.SEVEN;
    }
    const winChoice = totalPoints > 6 ? `${SevenUpDownChoice.UP}` : `${SevenUpDownChoice.DOWN}`;

    return `${totalPoints} - ${i18n.t(`SevenUpDown.glossary_${winChoice}`)}`;
};

export const calcTotalPoints = (result: ISevenUpDownResult): number => {
    return ["dice1", "dice2"].map((key) => result[key]).reduce((sum, value) => sum + value, 0);
};
