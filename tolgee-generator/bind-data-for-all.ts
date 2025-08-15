import { join } from "path";
import { findFiles, parseLanguageData, writeFileForGame } from "./io-utils";
import { getAllLanguages, getTranslations } from "./tolgee-utils";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";

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
            for (const language of languages._embedded.languages) {
                const languageFileName = sampleFileName[0].replace("-en.ts", `-${language.tag}.ts`);
                let parsedData = {};
                if (existsSync(languageFileName)) {
                    parsedData = parseLanguageData(languageFileName);
                }
                parsedData = parseLanguageData(sampleFileName[0]);
                const result = {};
                for (const namespace of Object.keys(parsedData)) {
                    const value = parsedData[namespace];
                    if (typeof value === "string") {
                        console.log(`Error: ${namespace} is not a string`);
                        continue;
                    }
                    result[namespace] = {};
                    for (const [key, _] of Object.entries(value)) {
                        const keyName = mappingKey[`${namespace}.${key}`];
                        if (!keyName) {
                            missingMapping[game] = missingMapping[game] || {};
                            missingMapping[game][namespace] = missingMapping[game][namespace] || {};
                            missingMapping[game][namespace][key] = "";
                            result[namespace][key] = parsedData[namespace][key];
                            continue;
                        }
                        const translation = translations[keyName]?.[language.tag];
                        if (!translation) {
                            missingTranslation[keyName] = missingTranslation[keyName] || {};
                            missingTranslation[keyName][language.tag] = "";
                            result[namespace][key] = parsedData[namespace][key];
                            continue;
                        }
                        result[namespace][key] = translation;
                    }
                }
                writeFileForGame(language.tag, languageFileName, result);
            }
        }
    }

    if (Object.keys(missingMapping).length > 0) {
        writeFileSync("./missing-mapping-all.json", JSON.stringify(missingMapping, null, 4));
    }
    if (Object.keys(missingTranslation).length > 0) {
        writeFileSync("./missing-translation-all.json", JSON.stringify(missingTranslation, null, 4));
    }
}

bindDataForAll();
