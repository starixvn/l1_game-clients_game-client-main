import * as i18n from "i18n/runtime-scripts/LanguageData";

import { getLanguage, getLocale } from "../auth/SessionManager";
import { FormationHandler } from "./FormationHandler";

const LocalizedLabel = require("LocalizedLabel");

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedLabelWithFormat")
export default class LocalizedLabelWithFormat extends LocalizedLabel {
    @property({ type: cc.Enum(FormationHandler) })
    format = FormationHandler.UPPER;

    @property()
    suffix = "";

    public dataId: string;

    updateLabel() {
        if (!this.label) {
            this.label = this.node.getComponent(cc.Label);

            if (!this.label) {
                cc.error("Failed to update localized label, label component is invalid!");
                return;
            }
        }
        let localizedString = i18n.t(this.dataId);
        if (localizedString) {
            localizedString = this.handleFormat(localizedString);
            if (this.suffix.length > 0) {
                localizedString += this.suffix;
            }
            this.label.string = localizedString;
        }
    }
    handleFormat(value: string) {
        const locale = getLocale();
        const language = getLanguage(locale);
        const data = [
            {
                condition: this.format === FormationHandler.LOWER,
                handle: this.lowerCase
            },
            {
                condition: this.format === FormationHandler.UPPER,
                handle: this.upperCase
            },
            {
                condition: this.format === FormationHandler.TITLE,
                handle: this.titleCase
            }
        ];
        const handler = data.filter((passed) => passed.condition);
        return handler.length && this.languageValidHandler() ? handler[0].handle(value) : value;
    }

    titleCase(value: string) {
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

    upperCase(value: string) {
        return value.toUpperCase();
    }

    lowerCase(value: string) {
        return value.toLowerCase();
    }

    languageValidHandler(): boolean {
        const locale = getLocale();
        const language = getLanguage(locale);

        return language !== "th";
    }
}
