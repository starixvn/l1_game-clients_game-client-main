import { existsSync, readFileSync, writeFileSync } from "fs";

const TOLGEE_API = "https://tolgee.sabagame.com";
const TOLGEE_TOKEN = "tgpak_gvpw45brha2xg3btoztxeytunvudc5dbn5twqodtonztc";

const DEFAULT_HEADERS = {
    "X-API-KEY": TOLGEE_TOKEN
};

async function get(path: string) {
    const res = await fetch(`${TOLGEE_API}/${path}`, {
        headers: DEFAULT_HEADERS
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${text}`);
    }

    const data = await res.json();
    return data;
}

async function getAllLanguagesFromTolgee(projectId = 5): Promise<{
    _embedded: {
        languages: {
            tag: string;
        }[];
    };
}> {
    return await get(`v2/projects/${projectId}/languages?size=1000`);
}

async function getAllTranslations(
    projectId = 5,
    languageTags: string[],
    cursor?: string
): Promise<{
    _embedded: {
        keys: {
            keyId: number;
            keyName: string;
            keyNamespace: string;
            translations: Record<
                string,
                {
                    text: string;
                }
            >;
        }[];
    };
    nextCursor?: string;
    page: {
        totalElements: number;
    };
}> {
    const queryLanguages = languageTags.map((tag) => `languages=${tag}`).join("&");
    const cursorQuery = cursor ? `&cursor=${cursor}` : "";
    return await get(`v2/projects/${projectId}/translations?size=10000&${queryLanguages}${cursorQuery}`);
}

async function exportDataFromTolgee(path: string) {
    const zipFile = await fetch(`${TOLGEE_API}/v2/projects/5/export`, {
        headers: DEFAULT_HEADERS
    });
    const zipBuffer = await zipFile.arrayBuffer();
    writeFileSync(path, new Uint8Array(zipBuffer));
}

function flatternTranslations(
    translations: {
        keyNamespace: string;
        keyName: string;
        translations: Record<string, { text: string }>;
    }[]
): Record<string, Record<string, string>> {
    const data = {};
    for (const key of translations) {
        data[`${key.keyNamespace}.${key.keyName}`] = Object.fromEntries(
            Object.entries(key.translations).map(([key, value]) => [key, value?.text || ""])
        );
    }
    return data;
}

const TRANSLATIONS_CACHE_PATH = "./tolgee-generator/cache/translations.json";

async function getTranslations(
    languages: {
        tag: string;
    }[]
) {
    if (existsSync(TRANSLATIONS_CACHE_PATH)) {
        return JSON.parse(readFileSync(TRANSLATIONS_CACHE_PATH, "utf-8"));
    }
    const rawTranslations = await getAllTranslations(
        5,
        languages.map((language) => language.tag)
    );

    let cursor = rawTranslations.nextCursor;
    let keys = rawTranslations._embedded.keys;
    while (keys.length < rawTranslations.page.totalElements) {
        const rawTranslations = await getAllTranslations(
            5,
            languages.map((language) => language.tag),
            cursor
        );
        keys = [...keys, ...rawTranslations._embedded.keys];
        cursor = rawTranslations.nextCursor;
    }
    const translations = flatternTranslations(keys);
    writeFileSync(TRANSLATIONS_CACHE_PATH, JSON.stringify(translations, null, 4));
    return translations;
}

const LANGUAGES_CACHE_PATH = "./tolgee-generator/cache/languages.json";

async function getAllLanguages(): Promise<{
    _embedded: {
        languages: {
            tag: string;
        }[];
    };
}> {
    if (existsSync(LANGUAGES_CACHE_PATH)) {
        return JSON.parse(readFileSync(LANGUAGES_CACHE_PATH, "utf-8"));
    }
    const languages = await getAllLanguagesFromTolgee();
    writeFileSync(LANGUAGES_CACHE_PATH, JSON.stringify(languages, null, 4));
    return languages;
}

export { getAllLanguages, getTranslations };
