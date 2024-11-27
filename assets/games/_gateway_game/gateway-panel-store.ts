import { ColumnLengthPattern } from "sc-scoreboards";
import { StorageManager } from "../../managers/StorageManager";
import {
    DEFAULT_PATTERNS,
    ONE_LOUNGE_2_ROOMS_BANKER,
    ONE_LOUNGE_2_ROOMS_PLAYER,
    PATTED_EAT_BANKER,
    PATTED_EAT_PLAYER,
    PING_PONG_BANKER,
    PING_PONG_PLAYER,
    STREAK_BANKER,
    STREAK_PLAYER
} from "../_baccarat/view-models/baccarat-big-road-good-road-patterns";
import { GatewayPanelStoreEvent } from "./gateway-panel-store-event";

const { ccclass, property } = cc._decorator;

interface GoodRoadSettingStorage {
    selectedPatternFlag: { [key: string]: boolean };
    categoryFilter: string[];
    goodRoadFilter: boolean;
}

@ccclass
export class GatewayPanelStore extends cc.Component {
    @property
    lobbyId = 0;

    readonly config = [
        { key: "streak_banker", pattern: STREAK_BANKER },
        { key: "streak_player", pattern: STREAK_PLAYER },

        { key: "ping_pong_banker", pattern: PING_PONG_BANKER },
        { key: "ping_pong_player", pattern: PING_PONG_PLAYER },

        { key: "patted_eat_banker", pattern: PATTED_EAT_BANKER },
        { key: "patted_eat_player", pattern: PATTED_EAT_PLAYER },

        { key: "one_lounge_two_bedrooms_banker", pattern: ONE_LOUNGE_2_ROOMS_BANKER },
        { key: "one_lounge_two_bedrooms_player", pattern: ONE_LOUNGE_2_ROOMS_PLAYER }
    ];
    patterns: ColumnLengthPattern[] = DEFAULT_PATTERNS;
    selectedPatternFlag = this.generateDefaultSelectedFlag();
    categoryFilter = [];
    allGamesFilter = false;

    counter = 0;
    goodRoads = [];
    eventGameSignIn = {};
    orderGameIds = [];

    private get storageKey() {
        return `good-road-setting-${this.lobbyId}`;
    }
    private generateDefaultSelectedFlag() {
        const flag = {};
        this.config.forEach((item) => {
            flag[item.key] = true;
        });

        return flag;
    }

    onLoad() {
        this.initStore();
    }

    initStore() {
        const storage = StorageManager.get(this.storageKey) as GoodRoadSettingStorage;
        if (!storage) {
            return;
        }
        const { selectedPatternFlag, goodRoadFilter, categoryFilter } = storage;
        if (selectedPatternFlag) {
            this.updateSelectedPatterns(selectedPatternFlag, false);
        }

        this.allGamesFilter = goodRoadFilter ?? true;
        if (categoryFilter) {
            this.categoryFilter = categoryFilter;
        }
    }

    updateSelectedPatterns(selectedFlag: { [key: string]: boolean }, saveStorage = true) {
        this.selectedPatternFlag = selectedFlag;
        this.node.emit(GatewayPanelStoreEvent.ChangedSelectedPatternFlag, this.selectedPatternFlag);
        this.updatePatterns();
        if (saveStorage) {
            this.saveStorage();
        }
    }

    onChangePatterns(selectedFlag: { [key: string]: boolean }) {
        this.updateSelectedPatterns(selectedFlag, true);
    }

    saveStorage() {
        const data = {
            selectedPatternFlag: this.selectedPatternFlag,
            goodRoadFilter: this.allGamesFilter,
            categoryFilter: this.categoryFilter
        };
        StorageManager.set(this.storageKey, data);
    }

    updatePatterns() {
        this.patterns = Object.keys(this.selectedPatternFlag)
            .filter((key) => this.selectedPatternFlag[key])
            .map((key) => this.config.find((c) => key === c.key)?.pattern)
            .filter((pattern) => !!pattern);

        this.node.emit(GatewayPanelStoreEvent.ChangedGoodRoadPattern, this.patterns);
    }
}
