import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join } from "path";
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

function parseLanguageData(filePath: string) {
    try {
        const content = readFileSync(filePath, "utf8");

        // Find the phrases object using regex
        const phrasesMatch = content.match(/export\s+const\s+phrases\s*=\s*({[\s\S]*?});/);

        if (!phrasesMatch) {
            return null;
        }

        // Extract the phrases object content
        const phrasesContent = phrasesMatch[1];

        try {
            const data = new Function(`return ${phrasesContent}`)();
            return data;
        } catch (error) {
            throw new Error(`Failed to parse object: ${error.message}`);
        }
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

function writeFileForGame(languageTag: string, path: string, data: Record<string, Record<string, any>>) {
    let fileContent = `import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = ${JSON.stringify(data, null, 4)};

reloadLanguageData("${languageTag}", phrases);`;

    fileContent = fileContent.replace(/"(\d+)"(?=\s*:\s*".*?")/g, "$1");
    fileContent = fileContent.replace(/\\\\n/g, "\\n");
    fileContent = fileContent.replace(/\\\\r/g, "\\r");

    writeFileSync(path, fileContent);
}

function findFiles(dir: string, pattern: RegExp) {
    let results = [];
    const list = readdirSync(dir);

    list.forEach((file) => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(findFiles(filePath, pattern));
        } else if (pattern.test(file)) {
            results.push(filePath);
        }
    });

    return results;
}

export { getAllKeyFromCommon, writeFileCommon, findFiles, parseLanguageData, writeFileForGame };
