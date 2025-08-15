import { getAllLanguages, getTranslations } from "./tolgee-utils";

(async () => {
    const languages = await getAllLanguages();
    const translations = await getTranslations(languages._embedded.languages);
    console.log(`Get done with languages ${translations.length}`);
})();
