import { join } from "path";
import { findFiles, parseLanguageData, writeFileForGame } from "./io-utils";
import { getAllLanguages, getTranslations } from "./tolgee-utils";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";

interface AddLanguageDataGameInput {
    game: string;
    sampleFileName: string;
    mappingKey: Record<string, string>;
    translations: Record<string, Record<string, string>>;
    languageTags: string[];
    missingMapping: any;
    missingTranslation: any;
}

async function bindDataForAll() {
    const languages = await getAllLanguages();
    const gamesDir = join(__dirname, "../assets/games");
    const games = readdirSync(gamesDir);
    const translations = await getTranslations(languages._embedded.languages);
    const mappingKeyAllGame = JSON.parse(readFileSync("./tolgee-generator/mapping-key/all-game-v2.json", "utf-8"));
    const missingMapping = {};
    const missingTranslation = {};
    for (const game of games) {
        const mappingKey = mappingKeyAllGame[game];
        if (existsSync(join(gamesDir, game, "i18n", "texts"))) {
            const sampleFileName = findFiles(join(gamesDir, game, "i18n", "texts"), new RegExp(`-en\\.ts$`));
            processGame({
                game,
                sampleFileName: sampleFileName[0],
                mappingKey,
                translations,
                languageTags: languages._embedded.languages.map((language) => language.tag),
                missingMapping,
                missingTranslation
            });
        }
    }

    if (Object.keys(missingMapping).length > 0) {
        writeFileSync("./missing-mapping-all.json", JSON.stringify(missingMapping, null, 4));
    }
    if (Object.keys(missingTranslation).length > 0) {
        writeFileSync("./missing-translation-all.json", JSON.stringify(missingTranslation, null, 4));
    }
}

function processGame({
    game,
    sampleFileName,
    mappingKey,
    translations,
    languageTags,
    missingMapping,
    missingTranslation
}: AddLanguageDataGameInput) {
    for (const languageTag of languageTags) {
        const languageFileName = sampleFileName.replace("-en.ts", `-${languageTag}.ts`);
        let parsedData = {};
        if (existsSync(languageFileName)) {
            parsedData = parseLanguageData(languageFileName);
        }
        parsedData = parseLanguageData(sampleFileName);
        const result = processNamespace({
            game,
            parsedData,
            mappingKey,
            translations,
            languageTag,
            missingMapping,
            missingTranslation
        });
        writeFileForGame(languageTag, languageFileName, result);
    }
}

interface ProcessNamespaceInput {
    game: string;
    parsedData: Record<string, any>;
    mappingKey: Record<string, string>;
    translations: Record<string, Record<string, string>>;
    languageTag: string;
    missingMapping: any;
    missingTranslation: any;
}
function processNamespace({
    game,
    parsedData,
    mappingKey,
    translations,
    languageTag,
    missingMapping,
    missingTranslation
}: ProcessNamespaceInput) {
    const result = {};
    for (const namespace of Object.keys(parsedData)) {
        const value = parsedData[namespace];
        if (typeof value === "string") {
            console.log(`Error: ${namespace} is not a string`);
            continue;
        }
        result[namespace] = translateData({
            game,
            namespace,
            value,
            mappingKey,
            translations,
            parsedData,
            languageTag,
            missingMapping,
            missingTranslation
        });
    }
    return result;
}

interface TranslateDataInput {
    game: string;
    namespace: string;
    value: Record<string, any>;
    mappingKey: Record<string, string>;
    translations: Record<string, Record<string, string>>;
    parsedData: Record<string, any>;
    languageTag: string;
    missingMapping: any;
    missingTranslation: any;
}
function translateData({
    game,
    namespace,
    parsedData,
    value,
    mappingKey,
    translations,
    languageTag,
    missingMapping,
    missingTranslation
}: TranslateDataInput) {
    const result = {};
    for (const [key, _] of Object.entries(value)) {
        const keyName = mappingKey[`${namespace}.${key}`];
        if (!keyName) {
            missingMapping[game] = missingMapping[game] || {};
            missingMapping[game][namespace] = missingMapping[game][namespace] || {};
            missingMapping[game][namespace][key] = "";
            result[key] = parsedData[namespace][key];
            continue;
        }
        const translation = translations[keyName]?.[languageTag];
        if (!translation) {
            missingTranslation[keyName] = missingTranslation[keyName] || {};
            missingTranslation[keyName][languageTag] = "";
            result[key] = parsedData[namespace][key];
            continue;
        }
        result[key] = translation;
    }
    return result;
}

bindDataForAll();
