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

export const currentYear: string = getCurrentYear();
export const currentMonth: Mes = getCurrentMonthAndYear().month;

function indexof(mes: string) {
    throw new Error("Function not implemented.");
}
