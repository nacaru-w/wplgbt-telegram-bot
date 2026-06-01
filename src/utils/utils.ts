import { Mes } from "../types/bot-types";
import { countryISOCodes } from "./iso-countries";

export const monthsInSpanish: Mes[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function getCurrentYear(): string {
    const currentYear = new Date().getFullYear();
    return currentYear.toString();
}

export function getCurrentMonthAndYear(): { month: Mes, year: string } {
    const currentMonthIndex = new Date().getMonth();
    return {
        month: monthsInSpanish[currentMonthIndex],
        year: getCurrentYear()
    }

}

export function getLastMonthAndYear(): { month: Mes, year: string } {
    const currentMonthObj = getCurrentMonthAndYear();
    const indexInMonthArray = monthsInSpanish.indexOf(currentMonthObj.month)
    const lastMonth = indexInMonthArray == 0 ? 'Diciembre' : monthsInSpanish[indexInMonthArray - 1];
    const correspondingYear = lastMonth !== 'Diciembre' ? currentMonthObj.year : +currentMonthObj.year - 1;
    return {
        month: lastMonth,
        year: correspondingYear.toString()
    }
}

/** Lowercases and strips diacritics so "México"/"Mexico" and casing differences all match. */
function foldCountryKey(value: string): string {
    return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

// Reverse lookup from country name to its ISO entry, so events written as a flag template
// ({{Bandera3|Bolivia}}) or as a plain/linked name resolve as well as bare ISO codes ({{BOL}}).
const countryByName: Record<string, { country: string, flag: string }> = Object.fromEntries(
    Object.values(countryISOCodes).map(entry => [foldCountryKey(entry.country), entry])
);

/**
 * Resolves the country (name + flag) behind an "evento del mes" cell, which may be an ISO code
 * ("CRI"), a flag-template body ("Bandera3|Bolivia"), a wikilink display ("Bolivia") or a plain
 * country name. Returns null when the event is not a country (e.g. a topic such as "literatura").
 */
export function resolveCountryFromEvent(event: string | null): { country: string, flag: string } | null {
    if (event == null) {
        return null;
    }
    // The body of a flag template carries the country after a pipe (e.g. "Bandera3|Bolivia"), so
    // test every pipe-separated segment against both the ISO table and the country-name table.
    for (const segment of event.split('|')) {
        const candidate = segment.trim();
        if (!candidate) {
            continue;
        }
        if (countryISOCodes[candidate]) {
            return countryISOCodes[candidate];
        }
        const byName = countryByName[foldCountryKey(candidate)];
        if (byName) {
            return byName;
        }
    }
    return null;
}

export function removeBrackets(input: string | null): string | null {
    if (!input) {
        return null;
    }

    // First, check if the input has double square brackets [[...]]
    let match = input.match(/^\[\[(?:.*?\|)?(.*?)\]\]$/);
    if (match) {
        return match[1];
    }

    // If no match for [[...]], check for double curly braces {{...}}
    match = input.match(/^\{\{(.*?)\}\}$/);
    if (match) {
        return match[1];
    }

    // Return the original input if no brackets were found
    return input;
}

export function titleCase(word: string): string {
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

// Groups whose title contains one of these keywords receive the lobby/reception welcome message
// instead of the standard one.
const LOBBY_GROUP_KEYWORDS = ['lobby', 'antesala', 'reception'];

/** True when the group title marks it as a lobby/reception group (case-insensitive match). */
export function isLobbyGroup(title: string | null | undefined): boolean {
    if (!title) {
        return false;
    }
    const lowered = title.toLowerCase();
    return LOBBY_GROUP_KEYWORDS.some(keyword => lowered.includes(keyword));
}

/**
 * Normalises a user-typed Spanish month into the canonical `Mes` value
 * (e.g. "junio" or "JUNIO" -> "Junio"). Returns null if it is not a valid month.
 */
export function normalizeMonth(input: string): Mes | null {
    if (!input) {
        return null;
    }
    const candidate = titleCase(input);
    return (monthsInSpanish as string[]).includes(candidate) ? (candidate as Mes) : null;
}

export function logAction(message: string, ...args: unknown[]): void {
    console.log(`[${new Date().toString()}] ${message}`, ...args);
}