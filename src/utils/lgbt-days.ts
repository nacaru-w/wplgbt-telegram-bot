import { LGBTDays } from "../types/bot-types";

function getTransgenderWeekDays(): number[] {
    const currentYear = new Date().getFullYear();
    const novemberFirst = new Date(currentYear, 10, 1); // November 1st

    // Get the day of the week for November 1st
    const firstDayOfWeek = novemberFirst.getDay();

    // Calculate the date of the first Monday in November
    // If November 1st is a Monday, first full week starts on November 1st
    let firstMonday = 1 + (8 - firstDayOfWeek) % 7;
    if (firstDayOfWeek === 0) {
        firstMonday = 2;
    }

    // Get the days of the first full week
    const weekDays: number[] = [];
    for (let i = 0; i < 7; i++) {
        weekDays.push(firstMonday + i);
    }

    return weekDays;
}

function getPronounsDay(): number[] {
    const currentYear = new Date().getFullYear();
    const octoberFirst = new Date(currentYear, 9, 1); // October 1st

    // Get the day of the week for October 1st
    const firstDayOfWeek = octoberFirst.getDay();

    // Calculate the date of the first Wednesday in October
    const firstWednesday = 1 + (3 - firstDayOfWeek + 7) % 7;

    // Calculate the date of the third Wednesday in October
    const thirdWednesday = firstWednesday + 14;

    return [thirdWednesday];
}


export const LGBTDaysDictionary: LGBTDays = {
    'Día Internacional contra la Homofobia en el Deporte': {
        keyword: 'lgbt',
        month: 2,
        days: [19]
    },
    'Día Internacional de la Visibilidad Trans': {
        keyword: 'trans',
        month: 3,
        days: [31]
    },
    'Día de la Visibilidad Lésbica': {
        keyword: 'lesbian',
        month: 4,
        days: [26]
    },
    'Día Internacional de la Asexualidad': {
        keyword: 'asexual',
        month: 4,
        days: [6]
    },
    'Día Internacional contra la Homofobia, Transfobia y Bifobia': {
        keyword: 'bisexual',
        month: 5,
        days: [17]
    },
    'Día del Orgullo Ágenero': {
        keyword: 'agender',
        month: 5,
        days: [19]
    },
    'Día de la Pansexualidad': {
        keyword: 'pan',
        month: 5,
        days: [24]
    },
    'Día internacional de la bandera LGBT+': {
        keyword: 'lgbt',
        month: 6,
        days: [25]
    },
    'Día Internacional del Orgullo LGBT+': {
        keyword: 'lgbt',
        month: 6,
        days: [28]
    },
    'Día Internacional de las Personas No Binarias': {
        keyword: 'nb',
        month: 7,
        days: [14]
    },
    'Día de la bandera trans': {
        keyword: 'trans',
        month: 8,
        days: [19]
    },
    'Día de la Visibilidad Bisexual': {
        keyword: 'bisexual',
        month: 9,
        days: [23]
    },
    'Día Internacional de las Lesbianas': {
        keyword: 'lesbian',
        month: 10,
        days: [8]
    },
    'Día para salir del armario': {
        keyword: 'lgbt',
        month: 10,
        days: [11]
    },
    'Día de las Rebeldías Lésbicas': {
        keyword: 'lesbian',
        month: 10,
        days: [13]
    },
    'Día Internacional de los Pronombres': {
        keyword: 'nb',
        month: 10,
        days: getPronounsDay()
    },
    'Día de la Concienciación Intersexual': {
        keyword: 'intersex',
        month: 10,
        days: [26]
    },
    'Día de las personas LGBT en la Ciencia': {
        keyword: 'lgbt',
        month: 11,
        days: [18]
    },
    'Semana de la Concienciación Transgénero': {
        keyword: 'trans',
        month: 11,
        days: [13, 14, 15, 16, 17, 18, 19]
    },
    'Día de la Memoria Intersexual': {
        keyword: 'intersex',
        month: 11,
        days: [8]
    },
    'Día de la Memoria Trans': {
        keyword: 'trans',
        month: 11,
        days: [20]
    }
}

