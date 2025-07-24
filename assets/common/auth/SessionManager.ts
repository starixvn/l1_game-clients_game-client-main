import * as i18n from "i18n/runtime-scripts/LanguageData";

import { StorageManager } from "../../managers/StorageManager";

declare global {
    export interface Window {
        i18n?: {
            languages?: any;
            curLang?: string;
        };
    }
}
export interface Session {
    username: string;
    language: string;
    ss: string;
    time: Date;
    isAuthenticated: boolean;
    system: number;
}

const sessionIdStorageName = "scss";
const micrositeGameIdKey = "microsite_game_id";
const clearStorageMicroSiteKey = "clear_storage_microsite";
const checkedTournamentPromotionFirstSso = "checked_tournament_promotion_first_sso";
const checkedFreeSpinsPromotionFirstSso = "checked_free_spins_promotion_first_sso";
const LOCALE_MAPPING = {
    "en-US": "en",
    "en-GB": "en",
    "en-UK": "en",
    "es-ES": "es",
    "fr-FR": "fr",
    "de-DE": "de",
    "zh-CN": "zh_cn",
    "ja-JP": "ja",
    "pt-BR": "pt",
    "ru-RU": "ru",
    "it-IT": "it",
    "ko-KR": "ko",
    "ar-SA": "ar",
    "hi-IN": "hi",
    "nl-NL": "nl",
    "sv-SE": "sv",
    "pl-PL": "pl",
    "tr-TR": "tr",
    "id-ID": "id",
    "th-TH": "th",
    "vi-VN": "vi",
    "da-DK": "da",
    "fi-FI": "fi",
    "no-NO": "no",
    "cs-CZ": "cs",
    "hu-HU": "hu",
    "el-GR": "el",
    "he-IL": "he",
    "uk-UA": "uk",
    "ro-RO": "ro",
    "sk-SK": "sk",
    "hr-HR": "hr",
    "bg-BG": "bg",
    "et-EE": "et",
    "lv-LV": "lv",
    "lt-LT": "lt",
    "sl-SI": "sl",
    "sr-RS": "sr",
    "en-CA": "en",
    "fr-CA": "fr",
    "es-MX": "es",
    "pt-PT": "pt",
    "zh-TW": "zh_tw",
    "en-AU": "en",
    "en-NZ": "en",
    "de-AT": "de",
    "de-CH": "de",
    "fr-CH": "fr",
    "it-CH": "it",
    "ar-EG": "ar",
    "ar-AE": "ar",
    "ar-DZ": "ar",
    "ar-MA": "ar",
    "ar-IQ": "ar",
    "ar-JO": "ar",
    "ar-KW": "ar",
    "ar-LB": "ar",
    "ar-OM": "ar",
    "ar-QA": "ar",
    "ar-SY": "ar",
    "ar-TN": "ar",
    "bn-BD": "bn",
    "bn-IN": "bn",
    "gu-IN": "gu",
    "kn-IN": "kn",
    "ml-IN": "ml",
    "mr-IN": "mr",
    "pa-IN": "pa",
    "ta-IN": "ta",
    "te-IN": "te",
    "ur-PK": "ur",
    "ko-KP": "ko",
    "ms-MY": "ms",
    "ms-BN": "ms",
    "ms-SG": "ms",
    "jv-ID": "jv",
    "su-ID": "su",
    "am-ET": "am",
    "sw-KE": "sw",
    "sw-TZ": "sw",
    "af-ZA": "af",
    "zu-ZA": "zu",
    "xh-ZA": "xh",
    "ga-IE": "ga",
    "cy-GB": "cy",
    "gd-GB": "gd",
    "eu-ES": "eu",
    "ca-ES": "ca",
    "gl-ES": "gl",
    "eo-EO": "eo",
    "az-AZ": "az",
    "be-BY": "be",
    "ka-GE": "ka",
    "kk-KZ": "kk",
    "ky-KG": "ky",
    "mn-MN": "mn",
    "ne-NP": "ne",
    "si-LK": "si",
    "lo-LA": "lo",
    "km-KH": "km",
    "my-MM": "my",
    "ug-CN": "ug",
    "ps-AF": "ps",
    "fa-IR": "fa",
    "dv-MV": "dv",
    "fo-FO": "fo",
    "is-IS": "is",
    "lb-LU": "lb"
};

export function getSessionKey() {
    if (window.location && window.location.hostname) {
        return `${window.location.hostname}.${sessionIdStorageName}`;
    }

    return sessionIdStorageName;
}

export function removeSession() {
    StorageManager.remove(getSessionKey());
}

export function getSession(): Session {
    return StorageManager.get(getSessionKey()) ?? {};
}

export function storeSessionData(data) {
    updateLanguage(data);
    StorageManager.set(getSessionKey(), data);
}

export function getLanguage(locale) {
    const localeMapping = {
        ...LOCALE_MAPPING,
        ...globalThis?.localeMapping
    };
    return localeMapping[locale] || "en";
}

export function getLocale() {
    const data = getSession();
    return data.language;
}

export function updateLanguage(data) {
    const locale = data.language;
    const language = getLanguage(locale);
    setLanguage(language);
}

export function setLanguage(language: string) {
    i18n.init(language);
    StorageManager.set(`current_language`, language);
}

export function getCacheLanguage(): string {
    return StorageManager.get(`current_language`) ?? "vi";
}

function getInRoomGameIdKey() {
    return "current_game_room_id";
}

function getInRoomGameIdStorage() {
    return StorageManager.get(getInRoomGameIdKey()) ?? {};
}

export function storeInRoomGameId(gameId) {
    cc.log("--------------------- storeInRoomGameId", gameId);
    const session = getSession();
    const ss = session.ss;
    if (ss) {
        const data = { ss, gameId };
        StorageManager.set(getInRoomGameIdKey(), data);
    }
}

const StorageKeyDummyRoom = "dummy-room";

export function storeDummyRoom(gameId) {
    cc.log("---------------------------store dummy room", gameId);
    const session = getSession();
    const ss = session.ss;
    if (ss) {
        const data = { ss, gameId };
        StorageManager.set(StorageKeyDummyRoom, data);
    }
}

export function getDummyRoomStorage() {
    const session = getSession();
    const ss = session.ss;
    if (ss) {
        const data = StorageManager.get(StorageKeyDummyRoom);
        if (data) {
            if (data.ss === ss) {
                return { gameId: data.gameId };
            }
        }
    }
    return null;
}

export function getInRoomGameId(checkValid = true) {
    const data = getInRoomGameIdStorage();
    if (checkValid) {
        const session = getSession();
        if (data.ss && session.ss && data.ss === session.ss) {
            return data.gameId;
        }
        return 0;
    } else {
        return data?.gameId || 0;
    }
}

export function removeInRoomGameId() {
    cc.log("--------------------- removeInRoomGameId");
    StorageManager.remove(getInRoomGameIdKey());
}

export function getDirectMode() {
    return StorageManager.get("direct_mode");
}

export function storeDirectMode(data) {
    StorageManager.set("direct_mode", data);
}

export function removeDirectMode() {
    StorageManager.remove("direct_mode");
}

export function getMicrositeGameId() {
    return StorageManager.get(micrositeGameIdKey) ?? 0;
}

export function storeMicrositeGameId(gameId) {
    StorageManager.set(micrositeGameIdKey, gameId);
}

export function removeMicrositeGameId() {
    StorageManager.remove(micrositeGameIdKey);
}

export function getClearStorageMicroSite(): boolean {
    return StorageManager.get(clearStorageMicroSiteKey) ?? false;
}

export function clearStorageMicroSite(isClear: boolean) {
    StorageManager.set(clearStorageMicroSiteKey, isClear);
}

export function getOperator() {
    return StorageManager.get("current_operator");
}

export function storeOperator(data) {
    StorageManager.set("current_operator", data);
}

export function removeOperator() {
    StorageManager.remove("current_operator");
}

export function setCheckedTournamentPromotionFirstSso(data = true) {
    StorageManager.set(checkedTournamentPromotionFirstSso, data);
}

export function getCheckedTournamentPromotionFirstSso(): boolean {
    return StorageManager.get(checkedTournamentPromotionFirstSso) ?? false;
}

export function setCheckedFreeSpinsPromotionFirstSso(data = true) {
    StorageManager.set(checkedFreeSpinsPromotionFirstSso, data);
}

export function getCheckedFreeSpinsPromotionFirstSso(): boolean {
    return StorageManager.get(checkedFreeSpinsPromotionFirstSso) ?? false;
}

export function removeCheckedTournamentPromotionFirstSso() {
    StorageManager.remove(checkedTournamentPromotionFirstSso);
}

export function removeCheckedFreeSpinsPromotionFirstSso() {
    StorageManager.remove(checkedFreeSpinsPromotionFirstSso);
}

declare global {
    export interface Window {
        authData: Session;
    }
}
