export default class SlotUtils {
    public static formatNamePool(name: string) {
        const pool = name[0].toUpperCase() + name.slice(1);
        return pool;
    }
}
