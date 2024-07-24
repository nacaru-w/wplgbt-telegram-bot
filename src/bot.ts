import { LGBTDaysDictionary } from './lgbt-days/lgbt-days';
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import cron from 'node-cron';

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const token = config.token;

const jsonFilePath = './idData.json';

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
            const cronExpression = `52 0 ${dayOfMonth.toString()} ${event.month.toString()} *`; // At 16:00 on the specified day and month
            cron.schedule(cronExpression, () => {
                const message = `__¡Hoy es el ${day}!__ 🌈\n[Más información en su artículo de Wikipedia](https://es.wikipedia.org/wiki/${encodeURIComponent(day)})!`
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
        bot.sendMessage(chatId, 'Este es el bot del WikiProyecto LGBT+!');
    }

    if (messageText === 'hola') {
        bot.sendMessage(chatId, '¡Hola!');
    }

})

bot.on('my_chat_member', (msg) => {
    const chatId = msg.chat.id;
    const chatTitle = msg.chat.title || 'untitled';
    console.log(chatId);
    console.log(msg.chat.title);

    saveData({ group: chatTitle, chatId: chatId });

    bot.sendMessage(chatId, `¡Hola! Esto es un mensaje que se envía cuando el bot es añadido en un grupo!`);
})

fetchData();
scheduleMessages();