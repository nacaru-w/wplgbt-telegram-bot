import { Article, EventoDelMesInfo, EventoDelMesRanking, LesbianArticleContribution, Mes, RankedEditor, TopLesbianArticleContributor } from "../types/bot-types";
import { MediawikiParams } from "../types/mediawiki-types";
import { currentMonth, currentYear, getLastMonthAndYear, removeDoubleSquareBrackets, titleCase } from "../utils/utils";

const headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'wikiproyecto-lgbt-telegram-bot/1.0 (https://t.me/wikiproyectolgbtbot icasaresr@gmail.com) TypeScript'
});

export async function getWikipediaPageContent(pageTitle: string): Promise<string> {
    let callUrl = "https://es.wikipedia.org/w/api.php?origin=*";

    const params: MediawikiParams = {
        action: "query",
        prop: "revisions",
        titles: pageTitle,
        rvprop: "content",
        rvslots: "main",
        formatversion: "2",
        format: "json"
    };

    for (let param in params) {
        callUrl += `&${param}=${params[param]}`;
    }

    try {
        const response = await fetch(callUrl, {
            method: 'GET',
            headers: headers
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data?.query?.pages[0]?.revisions[0]?.slots?.main?.content;
    } catch (error: any) {
        console.error('An error occurred:', error.message);
        return `An error occurred: ${error.message}`;
    }
}

function extractEventoDelMesTableByYear(content: string, year: string): string | null {
    const yearPattern = new RegExp(`===${year}===`, 'i');
    const yearSectionPattern = new RegExp(`===${year}===([\\s\\S]*?)(?===\\d{4}|$)`, 'i');

    if (!yearPattern.test(content)) {
        return null; // Year not found
    }

    const yearSectionMatch = content.match(yearSectionPattern);
    if (!yearSectionMatch) {
        return null; // No section for the specified year
    }

    return yearSectionMatch[1].trim();
}

function findEventForGivenTime(fullPage: string, year: string, month: Mes): string | null {
    // Extract the section for the specified year
    const yearSection = extractEventoDelMesTableByYear(fullPage, year);
    if (!yearSection) {
        return null;
    }

    // Define regex to match the month data
    const monthPattern = new RegExp(`\\| ${month}\\s*\\|\\s*([^|]*)`, 'i');
    const monthMatch = yearSection.match(monthPattern);

    return monthMatch ? monthMatch[1].trim() : null;
}

export async function getCurrentEventoDelMesInfo(): Promise<EventoDelMesInfo> {
    const wikiPage: string = "Wikiproyecto:LGBT/Evento del mes";

    const pageContent = await getWikipediaPageContent(wikiPage);
    const event = findEventForGivenTime(pageContent, currentYear, currentMonth)

    const eventObj = {
        event: removeDoubleSquareBrackets(event),
        month: currentMonth
    }

    return eventObj;
}

export async function getLastEventoDelMesInfo(): Promise<EventoDelMesInfo> {
    const wikiPage: string = "Wikiproyecto:LGBT/Evento del mes";
    const pageContent = await getWikipediaPageContent(wikiPage);
    const lastMonthAndYear = getLastMonthAndYear();

    const event = findEventForGivenTime(pageContent, lastMonthAndYear.year, lastMonthAndYear.month);

    const eventObj = {
        event: removeDoubleSquareBrackets(event),
        month: lastMonthAndYear.month
    }

    return eventObj

}

export async function getEventoParticipantInfo(month: string, year: string): Promise<EventoDelMesRanking[]> {
    const wikiPage: string = `Wikiproyecto:LGBT/País del mes/${titleCase(month)}/${year}`;
    const pageContent = await getWikipediaPageContent(wikiPage);
    return extractEventoParticipantInfoFromTable(pageContent);
}

export function isLesbianArticle(articleContent: string): boolean {
    const lesbianCategoryPattern = /\[\[Categoría:(?:[^\]]*(lesbiana|lésbica)[^\]]*)\]\]/i;
    return lesbianCategoryPattern.test(articleContent);
}

async function extractEventoParticipantInfoFromTable(text: string): Promise<EventoDelMesRanking[]> {
    // Extract the "Artículos trabajados" section
    const sectionRegex = /=== Artículos trabajados ===([\s\S]*?)===/;
    const sectionMatch = sectionRegex.exec(text);
    if (!sectionMatch) {
        return [];
    }
    const sectionText = sectionMatch[1];

    // Regular expression to match table rows in the "Artículos trabajados" section
    const rowRegex = /\|-\s*\n\|\s*(\d+)\s*\|\|\s*\[\[(.*?)\]\]\s*\|\|\s*(.*?)\s*\|\|\s*\{\{[^\|]+\|[^\}]+\}\}\s*\|\|\s*\{\{u\|([^\}]+)\}\}/g;
    let match;
    const userArticlesMap: Record<string, Article[]> = {};

    // Iterate over each row in the table
    while ((match = rowRegex.exec(sectionText)) !== null) {
        const [, , title, , username] = match;

        const cleanTitle = title.trim();

        // Fetch the content of the article
        const articleContent = await getWikipediaPageContent(cleanTitle);

        // Determine the number of characters and if the article is related to lesbian topics
        const characters = articleContent.length;
        const lesbian = isLesbianArticle(articleContent);

        // Create the article object
        const article: Article = {
            title: cleanTitle,
            characters,
            lesbian,
        };

        // Add the article to the user's list
        if (!userArticlesMap[username]) {
            userArticlesMap[username] = [];
        }
        userArticlesMap[username].push(article);
    }

    // Convert the map to an array of EventoDelMesRanking objects
    const result: EventoDelMesRanking[] = Object.entries(userArticlesMap).map(([username, articles]) => ({
        username,
        articles,
    }));

    return result;
}

export function rankEditors(eventoDelMesRankings: EventoDelMesRanking[]): RankedEditor[] {
    // Calculate the article count and total characters for each user
    const rankingData: RankedEditor[] = eventoDelMesRankings.map((entry) => {
        const articleCount = entry.articles.length;
        const totalCharacters = entry.articles.reduce((sum, article) => sum + article.characters, 0);

        return {
            username: entry.username,
            articleCount,
            totalCharacters,
        };
    });

    // Sort by article count in descending order, and by total characters in case of a tie
    rankingData.sort((a, b) => {
        if (b.articleCount === a.articleCount) {
            return b.totalCharacters - a.totalCharacters;
        }
        return b.articleCount - a.articleCount;
    });

    return rankingData;
}

export function findTopLesbianBiographyContributor(eventoDelMesInfo: EventoDelMesRanking[]): TopLesbianArticleContributor | null {
    const lesbianContributions: LesbianArticleContribution[] = eventoDelMesInfo.map((entry) => {
        // Filter only lesbian articles
        const lesbianArticles = entry.articles.filter(article => article.lesbian);
        const lesbianArticleCount = lesbianArticles.length;
        const totalLesbianCharacters = lesbianArticles.reduce((sum, article) => sum + article.characters, 0);

        return {
            username: entry.username,
            lesbianArticleCount,
            totalLesbianCharacters,
        };
    });

    // Sort by lesbian article count in descending order, and by total characters in case of a tie
    lesbianContributions.sort((a, b) => {
        if (b.lesbianArticleCount === a.lesbianArticleCount) {
            return b.totalLesbianCharacters - a.totalLesbianCharacters;
        }
        return b.lesbianArticleCount - a.lesbianArticleCount;
    });

    // Check if there are contributors with lesbian articles
    if (lesbianContributions.length === 0 || lesbianContributions[0].lesbianArticleCount === 0) {
        return null; // No valid contributors
    }

    // Return the username of the top contributor
    return {
        topLesbianContributor: lesbianContributions[0].username,
        numberOfLesbianArticles: lesbianContributions[0].lesbianArticleCount
    }
}