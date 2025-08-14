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

async function getAllLanguages(projectId = 5): Promise<{
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

function getAllKeyFromCommon(languageTag: string) {
    const files = readFileSync(`./assets/resources/i18n/${languageTag}.js`, "utf-8");
    const regex = /const\s+data\s*=\s*({[\s\S]*?});/;
    const match = files.match(regex);
    if (!match) {
        throw new Error("No matches found");
    }

    const objectContent = match[1];
    try {
        const data = new Function(`return ${objectContent}`)();
        return data;
    } catch (error) {
        throw new Error(`Failed to parse object: ${error.message}`);
    }
}

function writeFileCommon(languageTag: string, data: Record<string, Record<string, any>>) {
    let fileContent = `if (!window.i18n) window.i18n = {};
if (!window.i18n.languages) window.i18n.languages = {};
if (!window.i18n.languages.${languageTag}) window.i18n.languages.${languageTag} = {};

const data = ${JSON.stringify(data, null, 4)};

Object.assign(window.i18n.languages.${languageTag}, data);`;

    fileContent = fileContent.replace(/"(\d+)"(?=\s*:\s*".*?")/g, "$1");
    fileContent = fileContent.replace(/\\\\n/g, "\\n");
    fileContent = fileContent.replace(/\\\\r/g, "\\r");

    writeFileSync(`./assets/resources/i18n/${languageTag}.js`, fileContent);
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

async function getNewTranslations(languages: {
    _embedded: {
        languages: {
            tag: string;
        }[];
    };
}) {
    const rawTranslations = await getAllTranslations(
        5,
        languages._embedded.languages.map((language) => language.tag)
    );

    let cursor = rawTranslations.nextCursor;
    let keys = rawTranslations._embedded.keys;
    while (keys.length < rawTranslations.page.totalElements) {
        const rawTranslations = await getAllTranslations(
            5,
            languages._embedded.languages.map((language) => language.tag),
            cursor
        );
        keys = [...keys, ...rawTranslations._embedded.keys];
        cursor = rawTranslations.nextCursor;
    }
    const translations = flatternTranslations(keys);
    writeFileSync("./tolgee-generator/cache/translations.json", JSON.stringify(translations, null, 4));
    return translations;
}

async function bindDataForCommon() {
    const mappingKey = JSON.parse(readFileSync("./tolgee-generator/mapping-key/common.json", "utf-8"));
    const languages = await getAllLanguages();
    const rawTranslations = getTranslationsFromCache();
    const translations = Object.keys(rawTranslations).length > 0 ? rawTranslations : await getNewTranslations(languages);

    for (const language of languages._embedded.languages) {
        const result = {};
        let keyFromCommon = {};
        try {
            keyFromCommon = getAllKeyFromCommon(language.tag);
        } catch (error) {
            keyFromCommon = getAllKeyFromCommon("en");
        }
        for (const namespace of Object.keys(keyFromCommon)) {
            const value = keyFromCommon[namespace];
            if (typeof value === "string") {
                console.log(`Error: ${namespace} is not a string`);
                continue;
            }
            result[namespace] = {};
            for (const [key, _] of Object.entries(value)) {
                const keyName = mappingKey[namespace]?.[key];
                if (!keyName) {
                    console.log(`Missing mapping key: ${key} in ${namespace}`);
                    result[namespace][key] = keyFromCommon[namespace][key];
                    continue;
                }
                const translation = translations[keyName]?.[language.tag];
                if (!translation) {
                    console.log(`Missing translation: ${keyName} of ${namespace} in ${language.tag} `);
                    result[namespace][key] = keyFromCommon[namespace][key];
                    continue;
                }
                result[namespace][key] = translation;
            }
        }
        writeFileCommon(language.tag, result);
    }
}

bindDataForCommon();

// const ZIP_FILE = "./tolgee-generator/game-client.zip";
// const UNZIP_FOLDER = "./tolgee-generator/game-client";

// async function main() {
//     await exportDataFromTolgee(ZIP_FILE);
//     unzipFile(ZIP_FILE);
//     const translations = collectTranslations(UNZIP_FOLDER);
//     deleteFolder(UNZIP_FOLDER);
//     deleteFile(ZIP_FILE);
//     //deleteFile("./tolgee-generator/translations.json");
//     //const translations = JSON.parse(readFileSync("./tolgee-generator/translations.json", "utf-8"));
//     bindDataForCommon(translations);
// }

// main();
