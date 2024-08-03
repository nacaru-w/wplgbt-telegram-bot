// Bot uses node-telegram-bot-api, docs at: https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md
// Bot messages are written in MarkdownV2 style, check https://core.telegram.org/bots/api#markdownv2-style

import { LGBTDaysDictionary } from './lgbt-days/lgbt-days';
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import cron from 'node-cron';
import { getCurrentEventoDelMesInfo } from './services/mediawiki-service';
import { EventoDelMesInfo } from './types/bot-types';
import { currentYear, currentMonth, getCountryOnISO } from './utils/utils';

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const token = config.token;

const jsonFilePath = './idData.json';

let chatDictionary: { group: string, chatId: number }[] = [];

const addedMessage = String.raw
    `
¡Hola, soy el bot del *[WikiProyecto LGBT\+](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT)* en Wikipedia en español\!
Ahora mismo mis funciones son las siguientes:
· Saludar a la gente nueva\.
· Dar un aviso cuando estemos en una [Jornada de Concienciación LGBT\+](https://es.wikipedia.org/wiki/Anexo:Jornadas_de_concienciaci%C3%B3n_LGBT)\.
¡Nos vemos 🤖\! 
`

function newMemberMessageBuilder(newMember: string): string {
    return String.raw
        `
¡Hola, ${newMember}\! Te doy la bienvenida al grupo del *[WikiProyecto LGBT\+](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT)*\.
· Recuerda presentarte al grupo: indica tus pronombres y otros detalles sobre cómo quieres que nos refiramos a ti\.
· Indica tu _username_ en los proyectos Wikimedia\.
· Para asegurarnos de que el grupo es un espacio seguro para las personas que lo integran, evita enviar o difundir los temas de conversación que se hablen aquí\.
· Ten en cuenta que este grupo sigue la [política de espacios amigables](https://meta.wikimedia.org/wiki/Friendly_space_policies/es) y el [Código Universal de Conducta](https://meta.wikimedia.org/wiki/Universal_Code_of_Conduct/es)\.
¡Espero que disfrutes de tu paso por aquí\! ¡Nos vemos 🤖\! 
`
}

function eventoDelMesMessageBuilder(info: EventoDelMesInfo): string {
    let event = null;
    let country = null;
    if (info.event) {
        if (getCountryOnISO(info.event)) {
            country = getCountryOnISO(info.event);
        } else {
            country = null;
            event = info.event
        }
    }
    return String.raw
        `
¡Hola a todo el mundo\! Paso por aquí para recordaros que ya está en marcha el nuevo *[Evento del Mes](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Evento_del_mes)*\.
En este mes de ${info.month?.toLowerCase() || '...uh creo que olvidé el mes...'} celebramos el *${country ? `mes de ${country}` : `evento de ${event}`}*\:
    · Más información sobre el evento en *[su página en Wikipedia](https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Pa%C3%ADs_del_mes/${currentYear}/${info.month})*\.
    · Para consultar una lista de artículos sugeridos consulta *[esta página](${country ?
            `https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Solicitados/Pa%C3%ADses/${country}` :
            `https://es.wikipedia.org/wiki/Wikiproyecto:LGBT/Pa%C3%ADs_del_mes/${currentYear}/${currentMonth}#Art%C3%ADculos_sugeridos`
        })*\.
`
}

function fetchData() {
    console.log('⌛ Fetching chat data...')
    if (fs.existsSync(jsonFilePath)) {
        const data = fs.readFileSync(jsonFilePath, 'utf-8')
        chatDictionary = JSON.parse(data)
        console.log('✅ Fetched chat data!')
    }
}

function saveData(data: { group: string, chatId: number }): void {
    console.log('⌛ Updating chat data...');
    for (let o of chatDictionary) {
        if (data.chatId == o.chatId) {
            console.log('❌ Group is already part of the list');
            return
        }
    }
    chatDictionary.push(data);
    fs.writeFileSync(jsonFilePath, JSON.stringify(chatDictionary, null, 2), 'utf-8');
    console.log('✅ Chat data was successfully updated!')
}

function broadcastMessage(message: string) {
    chatDictionary.forEach((chat) => {
        // More formatting options for messages at https://core.telegram.org/bots/api#sendmessage
        bot.sendMessage(chat.chatId, message, { 'parse_mode': 'Markdown', 'disable_web_page_preview': true });
    })
}

const scheduleMessages = () => {
    console.log('⏰ Running scheduled messages...')
    for (let day in LGBTDaysDictionary) {
        const event = LGBTDaysDictionary[day];
        event.days.forEach((dayOfMonth: number) => {
            const cronExpression = `0 14 ${dayOfMonth.toString()} ${event.month.toString()} *`; // At 16:00 on the specified day and month
            cron.schedule(cronExpression, () => {
                const message = `🌈¡Hoy es ${LGBTDaysDictionary[day].days.length > 1 ? 'la' : 'el'} ${day}!🌈\n[Más información en su artículo de Wikipedia](https://es.wikipedia.org/wiki/${encodeURIComponent(day)})!`
                broadcastMessage(message);
                console.log('✅ Scheduled message sent:', message)
            })
        })
    }

}

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    if (messageText === '/start') {
        bot.sendMessage(chatId, '¡Este es el bot del WikiProyecto LGBT+!');
    }

    if (messageText === 'hola') {
        bot.sendMessage(chatId, '¡Hola!');
    }

    if (messageText === 'fetch') {
        const res = await getCurrentEventoDelMesInfo();
        bot.sendMessage(chatId, eventoDelMesMessageBuilder(res), { 'parse_mode': 'MarkdownV2', 'disable_web_page_preview': true });
    }

})

bot.on('my_chat_member', (msg) => {
    const chatId = msg.chat.id;
    const chatTitle = msg.chat.title || 'untitled';

    console.log(`🤖 Bot was added to group ${chatTitle}`)

    saveData({ group: chatTitle, chatId: chatId });

    bot.sendMessage(chatId, addedMessage, { 'parse_mode': 'MarkdownV2', 'disable_web_page_preview': true });
})

bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id
    const chatTitle = msg.chat.title
    const newMembers = msg.new_chat_members

    if (newMembers) {
        if (!newMembers[0].is_bot) {
            const newMember = newMembers[0]
            console.log(`❗ Greeting new member that was added to group ${chatTitle}`);
            bot.sendMessage(chatId, newMemberMessageBuilder(newMember.first_name || 'usuarie'), { 'parse_mode': 'MarkdownV2', 'disable_web_page_preview': true })
        }
    }

})

fetchData();
scheduleMessages();