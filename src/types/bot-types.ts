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

export interface LGBTDays {
    [name: string]: {
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
        'trans',
        month: number,
        days: number[]
    }
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