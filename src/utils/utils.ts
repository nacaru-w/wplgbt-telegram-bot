import { Mes } from "../types/bot-types";
import { countryISOCodes } from "./iso-countries";

function getCurrentYear(): string {
    const currentYear = new Date().getFullYear();
    return currentYear.toString();
}

function getCurrentMonthInSpanish(): Mes {
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

export const currentYear: string = getCurrentYear();
export const currentMonth: Mes = getCurrentMonthInSpanish();