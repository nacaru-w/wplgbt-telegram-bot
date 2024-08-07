import { EventoDelMesInfo, EventoDelMesRanking, Mes } from "../types/bot-types";
import { MediawikiParams } from "../types/mediawiki-types";
import { currentMonth, currentYear, removeDoubleSquareBrackets, titleCase } from "../utils/utils";

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


function extractEventoRanking(text: string): EventoDelMesRanking[] {
    // Extract the "Artículos trabajados" section
    const sectionRegex = /=== Artículos trabajados ===([\s\S]*?)===/;
    const sectionMatch = sectionRegex.exec(text);
    if (!sectionMatch) {
        return [];
    }
    const sectionText = sectionMatch[1];

    // Regular expression to match users, excluding {{u|---}}
    const userRegex = /{{u\|([^\}]+)}}/g;
    const userCounts: Record<string, number> = {};
    let match;

    // Count the occurrences of each user, excluding {{u|---}}
    while ((match = userRegex.exec(sectionText)) !== null) {
        const username = match[1];
        if (username !== '---') { // Exclude invalid username
            if (userCounts[username]) {
                userCounts[username]++;
            } else {
                userCounts[username] = 1;
            }
        }
    }

    // Convert the counts to an array and sort by count in descending order
    const sortedUsers = Object.entries(userCounts)
        .map(([username, count]) => ({ username, count }))
        .sort((a, b) => b.count - a.count);

    // Assign positions with handling for ties
    const result: EventoDelMesRanking[] = [];
    let currentPosition = 1;
    let currentRank = 1;

    for (let i = 0; i < sortedUsers.length; i++) {
        if (i > 0 && sortedUsers[i].count < sortedUsers[i - 1].count) {
            currentRank = i + 1;
        }
        if (currentRank <= 3) { // Only include top 3 positions
            result.push({
                position: currentRank,
                username: sortedUsers[i].username,
                articleCount: sortedUsers[i].count,
            });
        }
    }

    return result;
}

export async function getEventoRanking(month: string, year: string): Promise<EventoDelMesRanking[]> {
    const wikiPage: string = `Wikiproyecto:LGBT/País del mes/${titleCase(month)}/${year}`;
    const pageContent = await getWikipediaPageContent(wikiPage);
    return extractEventoRanking(pageContent);
}