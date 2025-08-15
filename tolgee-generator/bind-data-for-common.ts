import { readFileSync, writeFileSync } from "fs";
import { getAllLanguages, getTranslations } from "./tolgee-utils";
import { getAllKeyFromCommon, writeFileCommon } from "./io-utils";

async function bindDataForCommon() {
    const mappingKey = JSON.parse(readFileSync("./tolgee-generator/mapping-key/common.json", "utf-8"));
    const languages = await getAllLanguages();
    const translations = await getTranslations(languages._embedded.languages);
    const missingMapping = {};
    const missingTranslation = {};

    for (const language of languages._embedded.languages) {
        processLanguage({
            languageTag: language.tag,
            mappingKey,
            translations,
            missingMapping,
            missingTranslation
        });
    }

    if (Object.keys(missingMapping).length > 0) {
        writeFileSync("./missing-mapping-common.json", JSON.stringify(missingMapping, null, 4));
    }
    if (Object.keys(missingTranslation).length > 0) {
        writeFileSync("./missing-translation-common.json", JSON.stringify(missingTranslation, null, 4));
    }
}

interface ProcessLanguageInput {
    languageTag: string;
    mappingKey: Record<string, Record<string, string>>;
    translations: Record<string, Record<string, string>>;
    missingMapping: any;
    missingTranslation: any;
}

function processLanguage({ languageTag, mappingKey, translations, missingMapping, missingTranslation }: ProcessLanguageInput) {
    let keyFromCommon = {};

    try {
        keyFromCommon = getAllKeyFromCommon(languageTag);
    } catch (error) {
        keyFromCommon = getAllKeyFromCommon("en");
    }

    const result = processNamespace({
        keyFromCommon,
        mappingKey,
        translations,
        languageTag,
        missingMapping,
        missingTranslation
    });

    writeFileCommon(languageTag, result);
}

interface ProcessNamespaceInput {
    keyFromCommon: Record<string, any>;
    mappingKey: Record<string, Record<string, string>>;
    translations: Record<string, Record<string, string>>;
    languageTag: string;
    missingMapping: any;
    missingTranslation: any;
}

function processNamespace({
    keyFromCommon,
    mappingKey,
    translations,
    languageTag,
    missingMapping,
    missingTranslation
}: ProcessNamespaceInput) {
    const result = {};

    for (const namespace of Object.keys(keyFromCommon)) {
        const value = keyFromCommon[namespace];
        if (typeof value === "string") {
            console.log(`Error: ${namespace} is not a string`);
            continue;
        }

        result[namespace] = translateData({
            namespace,
            value,
            mappingKey,
            translations,
            keyFromCommon,
            languageTag,
            missingMapping,
            missingTranslation
        });
    }

    return result;
}

interface TranslateDataInput {
    namespace: string;
    value: Record<string, any>;
    mappingKey: Record<string, Record<string, string>>;
    translations: Record<string, Record<string, string>>;
    keyFromCommon: Record<string, any>;
    languageTag: string;
    missingMapping: any;
    missingTranslation: any;
}

function translateData({
    namespace,
    value,
    mappingKey,
    translations,
    keyFromCommon,
    languageTag,
    missingMapping,
    missingTranslation
}: TranslateDataInput) {
    const result = {};

    for (const [key, _] of Object.entries(value)) {
        const keyName = mappingKey[namespace]?.[key];
        if (!keyName) {
            missingMapping[namespace] = missingMapping[namespace] || {};
            missingMapping[namespace][key] = "";
            result[key] = keyFromCommon[namespace][key];
            continue;
        }

        const translation = translations[keyName]?.[languageTag];
        if (!translation) {
            missingTranslation[keyName] = missingTranslation[keyName] || {};
            missingTranslation[keyName][languageTag] = "";
            result[key] = keyFromCommon[namespace][key];
            continue;
        }

        result[key] = translation;
    }

    return result;
}

bindDataForCommon();
