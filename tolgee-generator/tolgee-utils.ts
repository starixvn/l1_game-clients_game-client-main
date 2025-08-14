import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";

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

function unzipFile(zipFile: string) {
    execSync(`powershell Expand-Archive -Path ${zipFile} -DestinationPath ./tolgee-generator/game-client`);
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
            Object.entries(key.translations).map(([key, value]) => [key, value.text])
        );
    }
    return data;
}

function collectTranslations(path: string) {
    const namespaces = readdirSync(path);
    const filter = namespaces.filter((namespace) => !namespace.includes(".json"));
    let result = {};
    for (const namespace of filter) {
        const files = readdirSync(`${path}/${namespace}`);
        result = {
            ...result,
            ...accumulateFromFolder(files, path, namespace)
        };
    }
    //writeFileSync("./tolgee-generator/translations.json", JSON.stringify(result, null, 4));
    return result;
}

function accumulateFromFolder(files: string[], path: string, namespace: string) {
    const result = {};
    for (const languageFile of files) {
        const data = JSON.parse(readFileSync(`${path}/${namespace}/${languageFile}`, "utf-8"));
        const languageTag = languageFile.replace(".json", "");
        for (const key of Object.keys(data)) {
            result[`${namespace}.${key}`] = {
                ...(result[`${namespace}.${key}`] || {}),
                [languageTag]: data[key]
            };
        }
    }
    return result;
}

function deleteFolder(path: string) {
    execSync(`powershell Remove-Item -Path ${path} -Recurse -Force`);
}

function deleteFile(path: string) {
    execSync(`powershell Remove-Item -Path ${path} -Force`);
}

function getTranslationsFromCache() {
    if (!existsSync("./tolgee-generator/cache/translations.json")) {
        return {};
    }
    const translations = JSON.parse(readFileSync("./tolgee-generator/cache/translations.json", "utf-8"));
    return translations;
}

async function getTranslations(
    languages: {
        tag: string;
    }[]
) {
    if (existsSync("./tolgee-generator/cache/translations.json")) {
        return JSON.parse(readFileSync("./tolgee-generator/cache/translations.json", "utf-8"));
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
    writeFileSync("./tolgee-generator/cache/translations.json", JSON.stringify(translations, null, 4));
    return translations;
}

async function getAllLanguages(): Promise<{
    _embedded: {
        languages: {
            tag: string;
        }[];
    };
}> {
    if (existsSync("./tolgee-generator/cache/languages.json")) {
        return JSON.parse(readFileSync("./tolgee-generator/cache/languages.json", "utf-8"));
    }
    const languages = await getAllLanguagesFromTolgee();
    writeFileSync("./tolgee-generator/cache/languages.json", JSON.stringify(languages, null, 4));
    return languages;
}

export { getAllLanguages, getTranslations };
