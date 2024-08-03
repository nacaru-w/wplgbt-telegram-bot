import { EventoDelMesInfo, Mes } from "../types/bot-types";
import { MediawikiParams } from "../types/mediawiki-types";
import { currentMonth, currentYear, removeDoubleSquareBrackets } from "../utils/utils";

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