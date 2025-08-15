import { join } from "path";
import { findFiles, parseLanguageData, writeFileForGame } from "./io-utils";
import { getAllLanguages, getTranslations } from "./tolgee-utils";
import { existsSync, readdirSync, readFileSync } from "fs";

async function bindDataForAll() {
    const languages = await getAllLanguages();
    const gamesDir = join(__dirname, "../assets/games");
    const games = readdirSync(gamesDir);
    const translations = await getTranslations(languages._embedded.languages);
    const mappingKeyAllGame = JSON.parse(readFileSync("./tolgee-generator/mapping-key/all-game-v2.json", "utf-8"));
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
                        const keyName = mappingKey[namespace]?.[key];
                        if (!keyName) {
                            console.log(`Missing mapping key: ${key} in ${namespace} in ${language.tag} in ${game}`);
                            result[namespace][key] = parsedData[namespace][key];
                            continue;
                        }
                        const translation = translations[keyName]?.[language.tag];
                        if (!translation) {
                            console.log(`Missing translation: ${keyName} of ${namespace} in ${language.tag} in ${game}`);
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
}

bindDataForAll();
