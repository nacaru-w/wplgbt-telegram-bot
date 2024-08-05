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

export interface EventoDelMesRanking {
    position: 1 | 2 | 3,
    username: string,
    articleCount: number
}