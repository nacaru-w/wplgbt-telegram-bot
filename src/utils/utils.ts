import { Mes } from "../types/bot-types";
import { countryISOCodes } from "./iso-countries";

export function getCurrentYear(): string {
    const currentYear = new Date().getFullYear();
    return currentYear.toString();
}

export function getCurrentMonthInSpanish(): Mes {
    const monthsInSpanish: Mes[] = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const currentMonthIndex = new Date().getMonth();
    return monthsInSpanish[currentMonthIndex];
}

export function getCountryOnISO(ISO: string | null): { country: string, flag: string } | null {
    if (ISO == null) {
        return null
    }
    return countryISOCodes[ISO] || null;
}

export function removeDoubleSquareBrackets(input: string | null): string | null {
    if (!input) {
        return null
    }

    const regex = /^\{\{(.*?)\}\}$/;
    const match = input.match(regex);

    if (match) {
        return match[1];
    }

    return input;
}

export function titleCase(word: string): string {
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

export function adaptToMarkdownV2(input: string): string {
    const specialCharacters = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    let escapedString = '';
    let i = 0;

    while (i < input.length) {
        if (input[i] === '[') {
            // Start of a potential markdown link
            const endLinkTextIndex = input.indexOf(']', i);
            const startUrlIndex = endLinkTextIndex !== -1 ? input.indexOf('(', endLinkTextIndex) : -1;
            const endUrlIndex = startUrlIndex !== -1 ? input.indexOf(')', startUrlIndex) : -1;

            if (endLinkTextIndex !== -1 && startUrlIndex === endLinkTextIndex + 1 && endUrlIndex !== -1) {
                // Confirmed markdown link, skip escaping inside the link
                escapedString += input.slice(i, endUrlIndex + 1);
                i = endUrlIndex + 1;
                continue;
            }
        }

        // Escape special characters outside markdown links
        if (specialCharacters.includes(input[i])) {
            escapedString += '\\' + input[i];
        } else {
            escapedString += input[i];
        }
        i++;
    }

    return escapedString;
}

export const currentYear: string = getCurrentYear();
export const currentMonth: Mes = getCurrentMonthInSpanish();