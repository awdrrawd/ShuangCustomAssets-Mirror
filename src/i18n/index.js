import { messages } from "./messages.js";

export const SUPPORTED_LANGUAGES = Object.freeze(['TW', 'CN', 'EN', 'DE', 'FR', 'RU', 'UA']);

export function getLanguage(raw = typeof TranslationLanguage === "undefined" ? "EN" : TranslationLanguage) {
    const code = String(raw ?? '').trim().replaceAll('_', '-').toUpperCase();
    if (/^ZH(?:-|$)/.test(code)) return /(?:TW|HK|MO|HANT)/.test(code) ? 'TW' : 'CN';
    const base = code.split('-')[0];
    if (base === 'UK' || base === 'UKR') return 'UA';
    return SUPPORTED_LANGUAGES.includes(base) ? base : 'EN';
}

export function isChineseLang() {
    return ['CN', 'TW'].includes(getLanguage());
}

// Retain the existing data-driven label API without leaving it limited to CN/EN.
const labelKeys = new Map(Object.keys(messages.EN).map(key => [JSON.stringify([messages.CN[key], messages.EN[key]]), key]));
export function L(cn, en) {
    const key = labelKeys.get(JSON.stringify([cn, en]));
    return key ? t(key) : isChineseLang() ? cn : en;
}

export function t(key, values = []) {
    const table = messages[getLanguage()];
    const message = Object.hasOwn(table, key) ? table[key] : Object.hasOwn(messages.EN, key) ? messages.EN[key] : String(key);
    return message.replace(/\{(\d+)\}/g, (match, index) => values[index] === undefined ? match : String(values[index]));
}
