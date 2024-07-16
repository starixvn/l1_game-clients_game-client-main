import { JackpotPoolType } from "../../../managers/JackpotManager";
import JackpotPoolItem from "./JackpotPoolItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JackpotPoolInfoBase extends cc.Component {
    @property({ type: JackpotPoolItem })
    items: JackpotPoolItem[] = [];

    setData(data: any[]) {
        if (!this.items || data.length < this.items.length) {
            return;
        }

        // sort jackpot pools descending
        const sortedData = [...data].sort((a, b) => {
            if (typeof a.pool === "string") {
                return +JackpotPoolType[b.pool.toUpperCase()] - +JackpotPoolType[a.pool.toUpperCase()];
            }

            return +b.pool - +a.pool;
        });

        this.items.forEach((item, index) => {
            if (index > sortedData.length - 1) {
                return;
            }

            const itemData = sortedData[index];
            item.setData(itemData.amount);

            // using index to identify jackpot-pool belong to stake-level
            item.node.name = `${sortedData.length - index - 1}`;
        });
    }

    setHighlight(poolIndex: number) {
        this.items.forEach((item) => item.setHighlight(poolIndex === +item.node.name));
    }

    setVisibility(status: boolean) {
        this.node.opacity = status ? 255 : 0;
    }
}
