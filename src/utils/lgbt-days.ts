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

function getAromanticAwarenessWeekDays(): number[] {
    const currentYear = new Date().getFullYear();
    const februaryFourteenth = new Date(currentYear, 1, 14); // February 14th

    // The Aromantic Spectrum Awareness Week runs for a full week (Sunday–Saturday) starting on the
    // first Sunday strictly after February 14th.
    const dayOfWeek = februaryFourteenth.getDay(); // 0 = Sunday
    const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
    const firstSunday = 14 + daysUntilSunday;

    const weekDays: number[] = [];
    for (let i = 0; i < 7; i++) {
        weekDays.push(firstSunday + i);
    }

    return weekDays;
}

function getTransDepathologizationDay(): number[] {
    const currentYear = new Date().getFullYear();
    const octoberThirtyFirst = new Date(currentYear, 9, 31); // October 31st

    // The International Day of Action for Trans Depathologization is observed on the last Saturday
    // of October, so step back from the 31st to the most recent Saturday (day 6).
    const dayOfWeek = octoberThirtyFirst.getDay();
    const lastSaturday = 31 - ((dayOfWeek - 6 + 7) % 7);

    return [lastSaturday];
}


export const LGBTDaysDictionary: LGBTDays = {
    'Día Internacional contra la Homofobia en el Deporte': {
        keyword: 'lgbt',
        month: 2,
        days: [19]
    },
    'Semana de Concienciación sobre el Arromanticismo': {
        keyword: 'aro',
        month: 2,
        days: getAromanticAwarenessWeekDays(),
        period: 'week'
    },
    'Día de la Cero Discriminación': {
        keyword: 'lgbt',
        month: 3,
        days: [1]
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
    'Aniversario de la Ley de Identidad de Género': {
        keyword: 'trans',
        month: 5,
        days: [9],
        country: 'Argentina',
        flag: '🇦🇷',
        article: 'Ley de identidad de género (Argentina)'
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
    'Día Nacional de Lucha contra la Violencia y Crímenes de Odio hacia Lesbianas, Trans, Gays y Bisexuales': {
        keyword: 'lgbt',
        month: 5,
        days: [31],
        country: 'Perú',
        flag: '🇵🇪'
    },
    'Mes del Orgullo LGBT+': {
        keyword: 'lgbt',
        month: 6,
        days: [1, 30],
        period: 'month',
        article: 'Orgullo LGBT'
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
    'Aniversario de la Ley Zamudio': {
        keyword: 'lgbt',
        month: 7,
        days: [12],
        country: 'Chile',
        flag: '🇨🇱',
        article: 'Ley Zamudio'
    },
    'Día Internacional de las Personas No Binarias': {
        keyword: 'nb',
        month: 7,
        days: [14]
    },
    'Aniversario de la Ley de Matrimonio Igualitario': {
        keyword: 'lgbt',
        month: 7,
        days: [15],
        country: 'Argentina',
        flag: '🇦🇷',
        article: 'Matrimonio igualitario en Argentina'
    },
    'Día de la bandera trans': {
        keyword: 'trans',
        month: 8,
        days: [19]
    },
    'Día Nacional contra la Homofobia en Colombia': {
        keyword: 'lgbt',
        month: 8,
        days: [23],
        country: 'Colombia',
        flag: '🇨🇴',
        article: 'León Zuleta'
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
    'Día Internacional de Acción por la Despatologización Trans': {
        keyword: 'trans',
        month: 10,
        days: getTransDepathologizationDay()
    },
    'Día de las personas LGBT en la Ciencia': {
        keyword: 'lgbt',
        month: 11,
        days: [18]
    },
    'Semana de la Concienciación Transgénero': {
        keyword: 'trans',
        month: 11,
        days: [13, 14, 15, 16, 17, 18, 19],
        period: 'week'
    },
    'Día de la Memoria Intersexual': {
        keyword: 'intersex',
        month: 11,
        days: [8]
    },
    'Día de la Despenalización de la Homosexualidad en Ecuador': {
        keyword: 'lgbt',
        month: 11,
        days: [27],
        country: 'Ecuador',
        flag: '🇪🇨',
        article: 'Despenalización de la homosexualidad en Ecuador'
    },
    'Día de la Memoria Trans': {
        keyword: 'trans',
        month: 11,
        days: [20]
    },
    'Día Mundial de la Lucha contra el Sida': {
        keyword: 'lgbt',
        month: 12,
        days: [1]
    }
}

