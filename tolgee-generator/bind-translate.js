const fs = require("fs");
const path = require("path");

function customStringify(obj) {
    const entries = Object.entries(obj);
    const formattedEntries = entries.map(([key, value]) => {
        const formattedKey = !isNaN(key) ? key : `"${key}"`;
        let formattedValue;
        if (typeof value === 'string') {
            // Escape special characters in strings
            const escapedValue = value
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
            formattedValue = `"${escapedValue}"`;
        } else if (typeof value === 'object' && value !== null) {
            formattedValue = customStringify(value);
        } else {
            formattedValue = value;
        }
        return `${formattedKey}: ${formattedValue}`;
    });
    return `{${formattedEntries.join(', ')}}`;
}

function bindTranslate(languageCode = "ja") {
    const translations = JSON.parse(fs.readFileSync(path.join(__dirname, "output", `new-${languageCode}-apply.json`), "utf8"));
    const restructureTranslations = Object.keys(translations).reduce((acc, key) => {
        const [folder, namespace, keyName] = key.split(".");
        if (!acc[folder]) {
            acc[folder] = {};
        }
        if (!acc[folder][namespace]) {
            acc[folder][namespace] = {};
        }
        // Try to convert keyName to number if it's numeric
        const numericKey = !isNaN(keyName) ? parseInt(keyName, 10) : keyName;
        acc[folder][namespace][numericKey] = translations[key];
        return acc;
    }, {});

    for (const namespace of Object.keys(restructureTranslations)) {
        const dirPath = path.join(__dirname, '../assets/games', namespace, 'i18n', 'texts');
        const list = fs.readdirSync(dirPath);
        let filename = "";
        for (const file of list) {
            if (file.includes("en") && file.includes("ts")) {
                filename = file;
                break;
            }
        }
        filename = filename.replace("en.ts", `${languageCode}.ts`);
        fs.writeFileSync(path.join(dirPath, filename), `import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = ${customStringify(restructureTranslations[namespace])};

reloadLanguageData("${languageCode}", phrases);`);
    }
}

if (require.main === module) {
    const languageCode = process.argv[2];
    bindTranslate(languageCode);
}
