import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import { StoreBase } from "./definitions";
export abstract class GameDataBase extends EventEmitterBase {
    protected readonly stores: StoreBase[] = [];
    protected readonly eventHandlers = [];
    abstract getStore(storeName: string): StoreBase;
    abstract initHandlers(handlers: any[]): void;
    abstract addStores(stores: StoreBase[]): void;
    abstract receiveData(data: unknown): void;
    abstract reset(): void;
    abstract clearStoreListeners(): void;
}
