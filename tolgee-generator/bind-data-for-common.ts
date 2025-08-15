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
                    missingMapping[namespace] = missingMapping[namespace] || {};
                    missingMapping[namespace][key] = "";
                    result[namespace][key] = keyFromCommon[namespace][key];
                    continue;
                }
                const translation = translations[keyName]?.[language.tag];
                if (!translation) {
                    missingTranslation[keyName] = missingTranslation[keyName] || {};
                    missingTranslation[keyName][language.tag] = "";
                    result[namespace][key] = keyFromCommon[namespace][key];
                    continue;
                }
                result[namespace][key] = translation;
            }
        }
        writeFileCommon(language.tag, result);
    }

    if (Object.keys(missingMapping).length > 0) {
        writeFileSync("./missing-mapping-common.json", JSON.stringify(missingMapping, null, 4));
    }
    if (Object.keys(missingTranslation).length > 0) {
        writeFileSync("./missing-translation-common.json", JSON.stringify(missingTranslation, null, 4));
    }
}

bindDataForCommon();
