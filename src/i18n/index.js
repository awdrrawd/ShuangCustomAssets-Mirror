import { messages } from "./messages.js";

export function isChineseLang() {
    const language = typeof TranslationLanguage === "undefined" ? "EN" : TranslationLanguage;
    return language === "CN" || language === "TW";
}

/** For data-driven bilingual labels; all literal UI messages live in messages.js. */
export function L(cn, en) { return isChineseLang() ? cn : en; }

export function t(key, values = []) {
    const language = isChineseLang() ? "CN" : "EN";
    const message = messages[language][key] ?? messages.EN[key] ?? key;
    return message.replace(/\{(\d+)\}/g, (match, index) => values[index] === undefined ? match : String(values[index]));
}
