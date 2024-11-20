export interface MediawikiParams {
    [key: string]: string | number;
}

export interface ArticleObject {
    article: string;
    creationDate: string;
    creator?: string | null
}