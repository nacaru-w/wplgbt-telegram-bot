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
        // Moreformatting options for messages at https://core.telegram.org/bots/api#sendmessage
        bot.sendMessage(chat.chatId, message, { 'parse_mode': 'Markdown' });
    })
}

const scheduleMessages = () => {
    cron.schedule('*/2 * * * *', () => {
        broadcastMessage('Prueba de uso de [Cron](https://github.com/node-cron/node-cron) y de parseo de mensajes\n[Estas palabras](https://wmlgbt-es-web.toolforge.org/ deberían de contener un enlace a la página web del WikiProyecto LGBT+');
    });

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