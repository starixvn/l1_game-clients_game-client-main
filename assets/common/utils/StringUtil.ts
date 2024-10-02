import { getLanguage, getLocale } from "../auth/SessionManager";
import { FormationHandler } from "../i18n/FormationHandler";

export default class StringUtil {
    public static handleFormatTitle(value: string, format: FormationHandler) {
        const data = [
            {
                condition: format === FormationHandler.LOWER,
                handle: this.lowerCase
            },
            {
                condition: format === FormationHandler.UPPER,
                handle: this.upperCase
            },
            {
                condition: format === FormationHandler.TITLE,
                handle: this.titleCase
            }
        ];
        const handler = data.filter((passed) => passed.condition);
        return handler.length && this.languageValidHandler() ? handler[0].handle(value) : value;
    }

    private static titleCase(value: string) {
        const space = " ";
        const isBreakLine = value.includes("\n");
        const result = value
            .split(space)
            .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
            .join(space);
        if (!isBreakLine) {
            return result;
        }

        return result
            .split("\n")
            .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
            .join("\n");
    }

    private static upperCase(value: string) {
        return value.toUpperCase();
    }

    private static lowerCase(value: string) {
        return value.toLowerCase();
    }

    private static languageValidHandler(): boolean {
        const locale = getLocale();
        const language = getLanguage(locale);

        return language !== "th";
    }
}
