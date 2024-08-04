import { currentYear, currentMonth, getCountryOnISO } from "./utils";
import { EventoDelMesInfo } from "../types/bot-types";

export const startMessage = String.raw
    `
¡Este es el bot del WikiProyecto LGBT\+\!
· Usa /help para conocer las opciones de ayuda\.
· Añádeme a un grupo para que automáticamente avise de los días LGBT\+
· También saludaré a la gente nueva
¡Nos vemos 🤖\!
`;

export const helpMessage = String.raw
    `
Las opciones actuales son:
· /start \- Inicia el bot
· /eventodelmes \- Proporciona información sobre el [Evento del Mes](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Evento_del_mes) actual
`

export const addedMessage = String.raw
    `
¡Hola, soy el bot del *[WikiProyecto LGBT\+](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT)* en Wikipedia en español\!
Ahora mismo mis funciones son las siguientes:
· Saludar a la gente nueva\.
· Dar un aviso cuando estemos en una [Jornada de Concienciación LGBT\+](https://es.wikipedia.org/wiki/Anexo:Jornadas_de_concienciaci%C3%B3n_LGBT)\.
¡Nos vemos 🤖\! 
`;

export function newMemberMessageBuilder(newMember: string): string {
    return String.raw
        `
¡Hola, ${newMember}\! Te doy la bienvenida al grupo del *[WikiProyecto LGBT\+](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT)*\.
· Recuerda presentarte al grupo: indica tus pronombres y otros detalles sobre cómo quieres que nos refiramos a ti\.
· Indica tu _username_ en los proyectos Wikimedia\.
· Para asegurarnos de que el grupo es un espacio seguro para las personas que lo integran, evita enviar o difundir los temas de conversación que se hablen aquí\.
· Ten en cuenta que este grupo sigue la [política de espacios amigables](https://meta.wikimedia.org/wiki/Friendly_space_policies/es) y el [Código Universal de Conducta](https://meta.wikimedia.org/wiki/Universal_Code_of_Conduct/es)\.
¡Espero que disfrutes de tu paso por aquí\! ¡Nos vemos 🤖\! 
`
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
    return String.raw
        `
${addIntro ? '🗓️ ¡Hola a todo el mundo\! Paso por aquí para recordaros que ya está en marcha el nuevo *[Evento del Mes](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Evento_del_mes)*\.\n' : ''}En este mes de ${info.month?.toLowerCase() || '...uh creo que olvidé el mes...'} celebramos el *${country ? `mes de ${country} ${flag}` : `evento de ${event}`}*\:
· Más información sobre el evento en *[su página en Wikipedia](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Pa%C3%ADs_del_mes/${currentYear}/${info.month})*\.
· Para ver la lista de artículos sugeridos consulta *[esta página](${country ?
            `https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Solicitados/Pa%C3%ADses/${country}` :
            `https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Pa%C3%ADs_del_mes/${currentYear}/${currentMonth}#Art%C3%ADculos_sugeridos`
        })*\.
`
}