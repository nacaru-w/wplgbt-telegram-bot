export type Mes =
    | 'Enero'
    | 'Febrero'
    | 'Marzo'
    | 'Abril'
    | 'Mayo'
    | 'Junio'
    | 'Julio'
    | 'Agosto'
    | 'Septiembre'
    | 'Octubre'
    | 'Noviembre'
    | 'Diciembre';

export interface LGBTDayInfo {
    keyword:
    'agender' |
    'aro' |
    'asexual' |
    'bear' |
    'bisexual' |
    'fluid' |
    'genderqueer' |
    'intersex' |
    'lesbian' |
    'lgbt' |
    'nb' |
    'pan' |
    'trans';
    month: number;
    days: number[];
    /**
     * Length of the observance. 'week'/'month' are announced only on their first and last day
     * (with "comienza"/"termina" wording) instead of every day. Defaults to 'day'.
     */
    period?: 'day' | 'week' | 'month';
    /** Country name when this is a national (rather than international) observance; surfaced in the message. */
    country?: string;
    /** Optional emoji flag shown next to the country. */
    flag?: string;
    /** Wikipedia article title to link to, when it differs from the observance name (the dictionary key). */
    article?: string;
}

export interface LGBTDays {
    [name: string]: LGBTDayInfo;
}

export interface EventoDelMesInfo {
    event: string | null;
    month: Mes | null;
}

export interface CountryISOCodes {
    [key: string]: { country: string, flag: string }
}

export interface Article {
    title: string,
    characters: number,
    lesbian: boolean
}

export interface EventoDelMesRanking {
    username: string,
    articles: Article[]
}

export interface RankedEditor {
    username: string;
    articleCount: number;
    totalCharacters: number;
}

export interface LesbianArticleContribution {
    username: string;
    lesbianArticleCount: number;
    totalLesbianCharacters: number;
}

export interface TopLesbianArticleContributor {
    topLesbianContributor: string;
    numberOfLesbianArticles: number
}