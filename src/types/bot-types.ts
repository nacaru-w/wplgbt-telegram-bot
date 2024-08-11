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
    bytes: number,
    lesbian: boolean
}

export interface EventoDelMesRanking {
    username: string,
    position: number,
    articles: Article[]
}