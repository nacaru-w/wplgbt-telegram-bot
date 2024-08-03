// Bot uses node-telegram-bot-api, docs at: https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md
// Bot messages are written in MarkdownV2 style, check https://core.telegram.org/bots/api#markdownv2-style

import { LGBTDaysDictionary } from './utils/lgbt-days';
import TelegramBot, { SendMessageOptions } from 'node-telegram-bot-api';
import fs from 'fs';
import cron from 'node-cron';
import { getCurrentEventoDelMesInfo } from './services/mediawiki-service';
import { eventoDelMesMessageBuilder, addedMessage, newMemberMessageBuilder, startMessage, helpMessage } from './utils/messages';

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const token = config.token;

const jsonFilePath = './idData.json';
const standardOptions: SendMessageOptions = { 'parse_mode': 'MarkdownV2', 'disable_web_page_preview': true }
const legacyMarkdownOptions: SendMessageOptions = { 'parse_mode': 'Markdown', 'disable_web_page_preview': true }

let chatDictionary: { group: string, chatId: number }[] = [];

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

function broadcastMessage(message: string, options: SendMessageOptions) {
    chatDictionary.forEach((chat) => {
        // More formatting options for messages at https://core.telegram.org/bots/api#sendmessage
        bot.sendMessage(chat.chatId, message, options);
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
                broadcastMessage(message, legacyMarkdownOptions);
                console.log('✅ Scheduled message sent:', message)
            })
        })
    }

    const monthlyCronExpression = '0 18 1 * *'; // At 18:00 on the 1st day of every month
    cron.schedule(monthlyCronExpression, async () => {
        const res = await getCurrentEventoDelMesInfo();
        const message = eventoDelMesMessageBuilder(res, true);
        broadcastMessage(message, standardOptions);
        console.log('✅ Scheduled monthly message sent:');
    });

}

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    if (messageText == '/start' || messageText == '/start@wikiproyectolgbtbot') {
        bot.sendMessage(chatId, startMessage, standardOptions);
        console.log('✅ Start message sent')
    }

    if (messageText == '/help' || messageText == '/help@wikiproyectolgbtbot') {
        bot.sendMessage(chatId, helpMessage, standardOptions);
        console.log('✅ Help message sent')
    }

    if (messageText == '/eventodelmes' || messageText == '/eventodelmes@wikiproyectolgbtbot') {
        const res = await getCurrentEventoDelMesInfo();
        bot.sendMessage(chatId, eventoDelMesMessageBuilder(res, false), standardOptions);
        console.log('✅ Evento del mes response sent')
    }

})

bot.on('my_chat_member', (msg) => {
    const chatId = msg.chat.id;
    const chatTitle = msg.chat.title || 'untitled';

    console.log(`🤖 Bot was added to group ${chatTitle}`)

    saveData({ group: chatTitle, chatId: chatId });

    bot.sendMessage(chatId, addedMessage, standardOptions);
})

bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id
    const chatTitle = msg.chat.title
    const newMembers = msg.new_chat_members

    if (newMembers) {
        if (!newMembers[0].is_bot) {
            const newMember = newMembers[0]
            console.log(`❗ Greeting new member that was added to group ${chatTitle}`);
            bot.sendMessage(chatId, newMemberMessageBuilder(newMember.first_name || 'usuarie'), standardOptions)
        }
    }

})

fetchData();
scheduleMessages();