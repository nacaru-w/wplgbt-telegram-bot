import { resolveCountryFromEvent, getCurrentMonthAndYear, getCurrentYear, getLastMonthAndYear } from "./utils";
import { adaptLinkToURL, adaptToMarkdownV2, escapeSymbols, escapeUnderscores } from "./parsing";
import { EventoDelMesInfo, LGBTDayInfo, Mes, RankedEditor, TopLesbianArticleContributor } from "../types/bot-types";
import { ArticleObject } from "../types/mediawiki-types";
import pkg from "../../package.json"

export const startMessage = adaptToMarkdownV2(
    `
¡Este es el bot del WikiProyecto LGBT+! (versión ${pkg.version})
· Usa /help para conocer las opciones de ayuda.
· Añádeme a un grupo para que automáticamente avise de los días LGBT+
· También saludaré a la gente nueva
¡Nos vemos 🤖!
`);

export const helpMessage = adaptToMarkdownV2(
    `
Las opciones actuales son:
· /start - Inicia el bot
· /help o /ayuda - Muestra esta lista de comandos
· /eventodelmes - Proporciona información sobre el [Evento del Mes](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Evento_del_mes) actual
· /eventodelmesranking - Muestra la clasificación de participantes del evento del mes en curso
· /eventodelmesranking [mes] [año] - Muestra la clasificación de un mes concreto (por ejemplo: /eventodelmesranking junio 2024)
· /eventodelmesrankingpasado - Muestra la clasificación del evento del mes pasado
· /articulosayer - Muestra los artículos creados ayer y quién los creó
`)

export const addedMessage = adaptToMarkdownV2(
    `
¡Hola, soy el bot del *[WikiProyecto LGBT\\+](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT)* en Wikipedia en español!
Ahora mismo mis funciones son las siguientes:
- Saludar a la gente nueva.
- Dar un aviso cuando estemos en una [Jornada de Concienciación LGBT+](https://es.wikipedia.org/wiki/Anexo:Jornadas_de_concienciaci%C3%B3n_LGBT).
- Proporcionar información sobre el [Evento del Mes](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Evento_del_mes).
¡Nos vemos 🤖! 
`);

export const lobbyAddedMessage = adaptToMarkdownV2(
    `
¡Hola, soy el bot del *[WikiProyecto LGBT\\+](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT)* en Wikipedia en español!
Veo que esta es una *antesala* del grupo principal, así que aquí mi función es la siguiente:
- Dar la bienvenida a las personas nuevas y explicarles el protocolo de seguridad que deben seguir para poder acceder al grupo principal.
¡Nos vemos 🤖!
`);

export function newMemberMessageBuilder(newMember: string): string {
    const finalMessage = '¡Hola, ' + (newMember !== 'usuarie' ? '@' : '') + escapeUnderscores(newMember) + ', ' + adaptToMarkdownV2(`te doy la bienvenida al grupo de Telegram del *[WikiProyecto LGBT\\+](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT)*.

· Recuerda presentarte al grupo: indica tus pronombres y otros detalles sobre cómo quieres que nos refiramos a ti.
· Indica tu _username_ en los proyectos Wikimedia.
· Para asegurarnos de que el grupo es un espacio seguro para las personas que lo integran, evita enviar o difundir los temas de conversación que se hablen aquí.
· Ten en cuenta que este grupo sigue la [política de espacios amigables](https://meta.wikimedia.org/wiki/Friendly_space_policies/es) y el [Código Universal de Conducta](https://meta.wikimedia.org/wiki/Universal_Code_of_Conduct/es).

¡Espero que disfrutes de tu paso por aquí! ¡Nos vemos! 🤖 
`);

    return finalMessage;

};

export function lobbyMemberMessageBuilder(newMember: string): string {
    const finalMessage = '¡Hola, ' + (newMember !== 'usuarie' ? '@' : '') + escapeUnderscores(newMember) + ', ' + adaptToMarkdownV2(`te damos la bienvenida a la antesala del grupo de Telegram del *[WikiProyecto LGBT\\+](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT)*!

Este grupo es solo una *antesala* al *grupo principal*. Se te añadirá a él siguiendo un *protocolo de seguridad* para garantizar que es un *espacio seguro*:

· Indica tu *cuenta de Wikimedia* (puedes compartirla *en privado* con el equipo de administración si lo prefieres).
· Cuéntanos si has trabajado en *contenido LGBT\\+* en los proyectos Wikimedia.
· Asegúrate de haberte apuntado en la [lista de participantes del WikiProyecto LGBT+](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/participantes) en la Wikipedia en español.

Una vez nos facilites estos datos y tras la aprobación del equipo de administración, se realizará una *verificación* a través de la *función de «agradecer»* de tu cuenta en la Wikipedia en español. Cuando se complete, se te añadirá al *grupo principal*.

Todo este proceso existe para asegurar que el grupo principal siga siendo un *espacio seguro* para todas las personas que forman parte de él. ¡Gracias por tu comprensión y tu paciencia! ¡Nos vemos pronto! 🤖
`);

    return finalMessage;

};

/** Which moment of an observance a scheduled message announces. */
export type LGBTDayPhase = 'single' | 'start' | 'end';

/**
 * Builds the broadcast message for an LGBT+ day/week/month. Uses legacy Markdown (the parse mode
 * the scheduled broadcasts are sent with). For multi-day observances (week/month) the `phase`
 * switches the wording between "Hoy comienza..." (start) and "Hoy termina..." (end); single days
 * use "Hoy es...". National observances are explicitly flagged as such.
 */
export function lgbtDayMessageBuilder(name: string, info: LGBTDayInfo, phase: LGBTDayPhase): string {
    const period = info.period ?? 'day';
    // "la Semana" (feminine) vs. "el Mes"/"el Día"/"el Aniversario" (masculine).
    const article = period === 'week' ? 'la' : 'el';

    let opening: string;
    if (phase === 'start') {
        opening = `🌈¡Hoy comienza ${article} ${name}!🌈`;
    } else if (phase === 'end') {
        opening = `🌈¡Hoy termina ${article} ${name}!🌈`;
    } else {
        opening = `🌈¡Hoy es ${article} ${name}!🌈`;
    }

    const nationalNote = info.country
        ? ` 📍 Es una conmemoración nacional de ${info.country}${info.flag ? ` ${info.flag}` : ''}.`
        : '';

    const articleTitle = info.article ?? name;
    const link = `\n[Más información en su artículo de Wikipedia](https://es.wikipedia.org/wiki/${encodeURIComponent(articleTitle)})`;

    return `${opening}${nationalNote}${link}`;
}

export function eventoDelMesMessageBuilder(info: EventoDelMesInfo, addIntro: boolean): string {
    let event = null;
    let country = null;
    let flag = null;
    if (info.event) {
        const countryInfo = resolveCountryFromEvent(info.event)
        if (countryInfo) {
            country = countryInfo.country
            flag = countryInfo.flag
        } else {
            event = info.event
        }
    }
    const finalString =
        `
${addIntro ? '🗓️ ¡Hola a todo el mundo! Paso por aquí para recordaros que ya está en marcha el nuevo *[Evento del Mes](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Evento_del_mes)*.\n' : ''}En este mes de ${info.month?.toLowerCase() || '...uh creo que olvidé el mes...'} celebramos el *${country ? `mes de ${country} ${flag}` : `evento del ${event}`}*:
· Más información sobre el evento en *[su página en Wikipedia](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Evento_del_mes/${getCurrentYear()}/${info.month})*.
· Para ver la lista de artículos sugeridos consulta *[esta página](${country ?
            `https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Solicitados/Pa%C3%ADses/${country}` :
            `https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Evento_del_mes/${getCurrentYear()}/${getCurrentMonthAndYear().month}#Art%C3%ADculos_sugeridos`
        })*.
`

    return adaptToMarkdownV2(finalString);

}

export function eventoDelMesRankingMessageBuilder(
    rankedEditors: RankedEditor[],
    topLesbianContributorArr: TopLesbianArticleContributor[] | null,
    countryInfo: EventoDelMesInfo
): string {
    let rankingString = '\n';
    const medals = ['🥇', '🥈', '🥉'];

    // Build the ranking string
    rankedEditors.forEach((participant, index) => {
        rankingString += `- ${medals[index] || ''} *${escapeSymbols(participant.username)}* con *${participant.articleCount}* artículos (${participant.totalCharacters} bytes)\n`;
    });

    // Build the country and event information
    const country = resolveCountryFromEvent(countryInfo.event);
    let countryString = '';
    if (country) {
        countryString = `${country?.country} ${country?.flag}`;
    }

    const totalArticles = rankedEditors.reduce((acc, obj) => acc + obj.articleCount, 0);
    const participantCount = rankedEditors.length;

    // Build the final string with top lesbian contributor
    let finalString = `
En este *[evento del mes](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Evento_del_mes/${getCurrentYear()}/${getCurrentMonthAndYear().month}) de${country ? '' : 'l'} ${country ? countryString : escapeSymbols(countryInfo.event || '')}*, la clasificación actual es la siguiente:
${rankingString}
Han participado un total de __${participantCount} personas__. ${participantCount < 3 ? `Eso son pocas personas 😔, ¿por qué no te animas a participar?` : 'Si aún no te has animado a participar, ¡hazlo para aumentar ese número!'}
En total, se han creado o mejorado __${totalArticles} artículos__.
`;

    // Add the top lesbian contributor information
    if (topLesbianContributorArr) {
        if (topLesbianContributorArr.length > 1) {
            let lesbianTieString: string = '\n👭 Parece que hay empate en el primer puesto para la persona que más biografías de lesbianas redactó:'
            for (let lesbianContributor of topLesbianContributorArr) {
                const artCount = lesbianContributor.numberOfLesbianArticles;
                const contributor = escapeSymbols(lesbianContributor.topLesbianContributor);
                lesbianTieString += `\n- *${contributor}*, con ${artCount} artículo${artCount > 1 ? 's' : ''}`
            }
            finalString += lesbianTieString;
        } else {
            finalString += `\n👭 Enhorabuena a *${escapeSymbols(topLesbianContributorArr[0].topLesbianContributor)}* por ser quien más biografías de lesbianas ha creado hasta ahora en este evento, con un total de ${topLesbianContributorArr[0].numberOfLesbianArticles}.\n`;
        }
    } else {
        finalString += `\n⚠️ Aún no hay premio para la persona que haya redactado la mayor cantidad de artículos sobre biografías de lesbianas. ¿Podrías ser tú?\n`;
    }
    return adaptToMarkdownV2(finalString);
}

/**
 * Shared body for past-tense ranking messages (the closed editions: last month or a specific
 * month/year). Only the opening sentence (`leadIn`) differs between callers; the ranking list,
 * participation summary and lesbian-contributor section are identical. `leadIn` must be raw text
 * (it is escaped together with the rest by adaptToMarkdownV2).
 */
function buildPastEventoRankingMessage(
    leadIn: string,
    rankedEditors: RankedEditor[],
    topLesbianContributorArr: TopLesbianArticleContributor[] | null
): string {
    let rankingString = '\n';
    const medals = ['🥇', '🥈', '🥉'];

    // Build the ranking string
    rankedEditors.forEach((participant, index) => {
        rankingString += `- ${medals[index] || ''} *${escapeSymbols(participant.username)}* con *${participant.articleCount}* artículos (${participant.totalCharacters} bytes)\n`;
    });

    const totalArticles = rankedEditors.reduce((acc, obj) => acc + obj.articleCount, 0);
    const participantCount = rankedEditors.length;

    // Build the final string with top lesbian contributor
    let finalString = `
${leadIn}
${rankingString}
Participaron un total de __${participantCount} personas__. ${participantCount < 3 ? `Una pena que no participasen más 😔... ` : '¡Eso son bastantes personas!'}
En total, se crearon o mejoraron __${totalArticles} artículos__.
        `;

    // Add the top lesbian contributor information
    if (topLesbianContributorArr) {
        if (topLesbianContributorArr.length > 1) {
            let lesbianTieString: string = '\n👭 Parece que hubo empate en el primer puesto para la persona que más biografías de personas lesbianas redactó:'
            for (let lesbianContributor of topLesbianContributorArr) {
                const artCount = lesbianContributor.numberOfLesbianArticles;
                const contributor = escapeSymbols(lesbianContributor.topLesbianContributor);
                lesbianTieString += `\n- *${contributor}*, con ${artCount} artículo${artCount > 1 ? 's' : ''}`
            }
            finalString += lesbianTieString;
        } else {
            finalString += `\n👭 *${escapeSymbols(topLesbianContributorArr[0].topLesbianContributor)}* fue quien más biografías de lesbianas redactó, con un total de ${topLesbianContributorArr[0].numberOfLesbianArticles} artículos.\n`;
        }
    } else {
        finalString += `\nNadie escribió artículos sobre mujeres lesbianas... qué mal 😕\n`;
    }

    return adaptToMarkdownV2(finalString);
}

/** Builds the descriptor for the event behind a ranking, e.g. "de Argentina 🇦🇷" or "del literatura LGBT+". */
function buildEventoDescriptor(countryInfo: EventoDelMesInfo): string {
    const country = resolveCountryFromEvent(countryInfo.event);
    const name = country ? `${country.country} ${country.flag}` : escapeSymbols(countryInfo.event || '');
    return `de${country ? '' : 'l'} ${name}`;
}

export function lastEventoDelMesRankingBuilder(
    rankedEditors: RankedEditor[],
    topLesbianContributorArr: TopLesbianArticleContributor[] | null,
    countryInfo: EventoDelMesInfo
): string {
    const lastMonthObj: { month: Mes, year: string } = getLastMonthAndYear();
    const leadIn = `En el último *[evento del mes](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Evento_del_mes/${lastMonthObj.year}/${lastMonthObj.month}) ${buildEventoDescriptor(countryInfo)}*, la clasificación fue la siguiente:`;
    return buildPastEventoRankingMessage(leadIn, rankedEditors, topLesbianContributorArr);
}

export function specificEventoDelMesRankingBuilder(
    rankedEditors: RankedEditor[],
    topLesbianContributorArr: TopLesbianArticleContributor[] | null,
    countryInfo: EventoDelMesInfo,
    monthYear: { month: Mes, year: string }
): string {
    const leadIn = `En el *[evento del mes](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Evento_del_mes/${monthYear.year}/${monthYear.month}) ${buildEventoDescriptor(countryInfo)}* de ${monthYear.month.toLowerCase()} de ${monthYear.year}, la clasificación fue la siguiente:`;
    return buildPastEventoRankingMessage(leadIn, rankedEditors, topLesbianContributorArr);
}

export const eventoRankingUsageMessage = adaptToMarkdownV2(
    `
Para ver la clasificación de un mes concreto, indica el mes y el año en español. Por ejemplo:
· /eventodelmesranking junio 2024
También puedes escribir /eventodelmesranking sin nada más para ver la del mes en curso.
`);

export function noEventoDataMessageBuilder(month: Mes, year: string): string {
    return adaptToMarkdownV2(
        `No he encontrado datos de ningún evento del mes para ${month.toLowerCase()} de ${year} 😕. ¿Seguro que el mes y el año son correctos?`
    );
}

export function announceYesterdaysCreators(yesterdaysArticles: ArticleObject[], streak?: { oldStreak: number, newStreak: number }): string {
    let list = '';
    for (let article of yesterdaysArticles) {
        if (article.creator) {
            list += `· *[${escapeSymbols(article.article)}](https://es.wikipedia.org/wiki/${adaptLinkToURL(article.article)})*, de *${escapeSymbols(article.creator)}*\n`
        } else {
            list += `· ~*[${escapeSymbols(article.article)}](https://es.wikipedia.org/wiki/${adaptLinkToURL(article.article)})*~ \(_artículo borrado_\) \n`
        }
    }

    let streakMessage = '';
    if (streak) {
        streakMessage = `${streak.newStreak ? `Son *${streak.newStreak}* días seguidos en los que se ha creado algún artículo!` : `Además, esto significa que la racha de ${streak.oldStreak} días se acabó aquí 😞...`}\n\n`
    }

    const message = `
¡Hola!🤖

Vengo aquí para anunciar los artículos que se crearon en el día de ayer. ¿Estáis nervioses? 😰 yo no, porque soy un bot y no siento emociones. En fin, que aquí está la lista:

${list ? list : 'Pues... no hay lista porque nadie hizo nada ayer 😑\n'}
${streakMessage}Nada más por ahora. ${list ? 'Un besete 🌺' : 'Un besete... supongo 🥀'}
    `
    return adaptToMarkdownV2(message);

}