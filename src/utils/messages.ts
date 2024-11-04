import { currentYear, currentMonth, getCountryOnISO, getLastMonthAndYear } from "./utils";
import { adaptToMarkdownV2 } from "./parsing";
import { EventoDelMesInfo, Mes, RankedEditor, TopLesbianArticleContributor } from "../types/bot-types";

export const startMessage = adaptToMarkdownV2(
    `
¡Este es el bot del WikiProyecto LGBT+!
· Usa /help para conocer las opciones de ayuda.
· Añádeme a un grupo para que automáticamente avise de los días LGBT+
· También saludaré a la gente nueva
¡Nos vemos 🤖!
`);

export const helpMessage = adaptToMarkdownV2(
    `
Las opciones actuales son:
· /start - Inicia el bot
· /eventodelmes - Proporciona información sobre el [Evento del Mes](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Evento_del_mes) actual
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

export function newMemberMessageBuilder(newMember: string): string {
    const finalString =
        `
¡Hola, @${newMember}! Te doy la bienvenida al grupo de Telegram del *[WikiProyecto LGBT\\+](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT)*.

· Recuerda presentarte al grupo: indica tus pronombres y otros detalles sobre cómo quieres que nos refiramos a ti.
· Indica tu _username_ en los proyectos Wikimedia.
· Para asegurarnos de que el grupo es un espacio seguro para las personas que lo integran, evita enviar o difundir los temas de conversación que se hablen aquí.
· Ten en cuenta que este grupo sigue la [política de espacios amigables](https://meta.wikimedia.org/wiki/Friendly_space_policies/es) y el [Código Universal de Conducta](https://meta.wikimedia.org/wiki/Universal_Code_of_Conduct/es).

¡Espero que disfrutes de tu paso por aquí! ¡Nos vemos 🤖! 
`;

    return adaptToMarkdownV2(finalString);

};

export function eventoDelMesMessageBuilder(info: EventoDelMesInfo, addIntro: boolean): string {
    let event = null;
    let country = null;
    let flag = null;
    if (info.event) {
        const countryInfo = getCountryOnISO(info.event)
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
· Más información sobre el evento en *[su página en Wikipedia](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Pa%C3%ADs_del_mes/${currentYear}/${info.month})*.
· Para ver la lista de artículos sugeridos consulta *[esta página](${country ?
            `https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Solicitados/Pa%C3%ADses/${country}` :
            `https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Pa%C3%ADs_del_mes/${currentYear}/${currentMonth}#Art%C3%ADculos_sugeridos`
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
        rankingString += `- ${medals[index] || ''} *${participant.username}* con *${participant.articleCount}* artículos (${participant.totalCharacters} bytes)\n`;
    });

    // Build the country and event information
    const country = getCountryOnISO(countryInfo.event);
    let countryString = '';
    if (country) {
        countryString = `${country?.country} ${country?.flag}`;
    }

    const totalArticles = rankedEditors.reduce((acc, obj) => acc + obj.articleCount, 0);
    const participantCount = rankedEditors.length;

    // Build the final string with top lesbian contributor
    let finalString = `
En este *[evento del mes](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Pa%C3%ADs_del_mes/${currentYear}/${currentMonth}) de${country ? '' : 'l'} ${country ? countryString : countryInfo.event}*, la clasificación actual es la siguiente:
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
                const contributor = lesbianContributor.topLesbianContributor;
                lesbianTieString += `\n- *${contributor}*, con ${artCount} artículo${artCount > 1 ? 's' : ''}`
            }
            finalString += lesbianTieString;
        } else {
            finalString += `\n👭 Enhorabuena a *${topLesbianContributorArr[0].topLesbianContributor}* por ser quien más biografías de lesbianas ha creado hasta ahora en este evento, con un total de ${topLesbianContributorArr[0].numberOfLesbianArticles}.\n`;
        }
    } else {
        finalString += `\n⚠️ Aún no hay premio para la persona que haya redactado la mayor cantidad de artículos sobre biografías de lesbianas. ¿Podrías ser tú?\n`;
    }
    return adaptToMarkdownV2(finalString);
}

export function lastEventoDelMesRankingBuilder(
    rankedEditors: RankedEditor[],
    topLesbianContributorArr: TopLesbianArticleContributor[] | null,
    countryInfo: EventoDelMesInfo
): string {
    let rankingString = '\n';
    const medals = ['🥇', '🥈', '🥉'];

    // Build the ranking string
    rankedEditors.forEach((participant, index) => {
        rankingString += `- ${medals[index] || ''} *${participant.username}* con *${participant.articleCount}* artículos (${participant.totalCharacters} bytes)\n`;
    });

    // Build the country and event information
    const country = getCountryOnISO(countryInfo.event);
    let countryString = '';
    if (country) {
        countryString = `${country?.country} ${country?.flag}`;
    }

    const totalArticles = rankedEditors.reduce((acc, obj) => acc + obj.articleCount, 0);
    const participantCount = rankedEditors.length;
    const lastMonthObj: { month: Mes, year: string } = getLastMonthAndYear();

    // Build the final string with top lesbian contributor
    let finalString = `
En el último *[evento del mes](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Pa%C3%ADs_del_mes/${lastMonthObj.year}/${lastMonthObj.month}) de${country ? '' : 'l'} ${country ? countryString : countryInfo.event}*, la clasificación fue la siguiente:
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
                const contributor = lesbianContributor.topLesbianContributor;
                lesbianTieString += `\n- *${contributor}*, con ${artCount} artículo${artCount > 1 ? 's' : ''}`
            }
            finalString += lesbianTieString;
        } else {
            finalString += `\n👭 *${topLesbianContributorArr[0].topLesbianContributor}* fue quien más biografías de lesbianas redactó, con un total de ${topLesbianContributorArr[0].numberOfLesbianArticles} artículos.\n`;
        }
    } else {
        finalString += `\nNadie escribió artículos sobre mujeres lesbianas... qué mal 😕\n`;
    }

    return adaptToMarkdownV2(finalString);
}