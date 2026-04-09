// Bot uses node-telegram-bot-api, docs at: https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md
// Bot messages are written in MarkdownV2 style, check https://core.telegram.org/bots/api#markdownv2-style

import { LGBTDaysDictionary } from './utils/lgbt-days';
import TelegramBot, { SendMessageOptions } from 'node-telegram-bot-api';
import fs from 'fs';
import cron from 'node-cron';
import { findTopLesbianBiographyContributors, getCurrentEventoDelMesInfo, getEventoParticipantInfo, getLastEventoDelMesInfo, getYesterdaysPagesAndCreators, rankEditors } from './services/mediawiki-service';
import { eventoDelMesMessageBuilder, addedMessage, newMemberMessageBuilder, startMessage, helpMessage, eventoDelMesRankingMessageBuilder, lastEventoDelMesRankingBuilder, announceYesterdaysCreators } from './utils/messages';
import { getCurrentMonthAndYear, getLastMonthAndYear, logAction } from './utils/utils';
import { Mes } from './types/bot-types';

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const token = config.token;

const jsonFilePath = './data/idData.json';

const standardMV2Options: SendMessageOptions = { 'parse_mode': 'MarkdownV2', 'disable_web_page_preview': true }
const legacyMarkdownOptions: SendMessageOptions = { 'parse_mode': 'Markdown', 'disable_web_page_preview': true }

let chatDictionary: { group: string, chatId: number }[] = [];
let streak: number = 0;

function fetchData() {
    logAction('⌛ Fetching chat and streak data...')
    if (fs.existsSync(jsonFilePath)) {
        const data = fs.readFileSync(jsonFilePath, 'utf-8')
        const parsedData: { groups: { group: string, chatId: number }[], streak: number } = JSON.parse(data)
        chatDictionary = parsedData.groups;
        streak = parsedData?.streak ?? 0;
        logAction('✅ Fetched chat and streak data!')
    } else {
        const initialData = { groups: [], streak: 0 };
        fs.writeFileSync(jsonFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
        logAction('📄 idData.json did not exist, created with default values')
    }
}

function saveData(data: { group: string, chatId: number }): void {
    logAction('⌛ Updating chat data...');
    for (let o of chatDictionary) {
        if (data.chatId == o.chatId) {
            logAction('❌ Group is already part of the list');
            return
        }
    }
    chatDictionary.push(data);
    const idData = { groups: chatDictionary, streak };
    fs.writeFileSync(jsonFilePath, JSON.stringify(idData, null, 2), 'utf-8');
    logAction('✅ Chat data was successfully updated!');
}

function saveStreak(newArticles: boolean) {
    logAction('⌛ Updating streak data...');
    streak = newArticles ? (streak + 1) : 0;
    const idData = { groups: chatDictionary, streak };
    fs.writeFileSync(jsonFilePath, JSON.stringify(idData), 'utf-8');
    logAction('✅ Streak data was successfully updated!');
}

async function broadcastMessage(message: string, options: SendMessageOptions) {
    if (!chatDictionary || chatDictionary.length === 0) {
        logAction('⚠️ No chats registered for broadcast');
        return;
    }
    for (const chat of chatDictionary) {
        try {
            await bot.sendMessage(chat.chatId, message, options);
        } catch (error) {
            logAction(`❌ Failed to send message to ${chat.group} (${chat.chatId}):`, error);
        }
    }
}

const scheduleMessages = () => {
    logAction('⏰ Running scheduled messages...')
    for (let day in LGBTDaysDictionary) {
        const event = LGBTDaysDictionary[day];
        event.days.forEach((dayOfMonth: number) => {
            const cronExpression = `0 14 ${dayOfMonth.toString()} ${event.month.toString()} *`; // At 16:00 on the specified day and month
            cron.schedule(cronExpression, async () => {
                try {
                    const message = `🌈¡Hoy es ${LGBTDaysDictionary[day].days.length > 1 ? 'la' : 'el'} ${day}!🌈\n[Más información en su artículo de Wikipedia](https://es.wikipedia.org/wiki/${encodeURIComponent(day)})!`
                    await broadcastMessage(message, legacyMarkdownOptions);
                    logAction(`✅ Scheduled ${day} message sent`)
                } catch (error) {
                    logAction(`❌ Failed to send scheduled ${day} message:`, error);
                }
            })
        })
    }

    const monthlyCronExpression = '0 18 1 * *'; // At 18:00 on the 1st day of every month
    cron.schedule(monthlyCronExpression, async () => {
        try {
            const res = await getCurrentEventoDelMesInfo();
            const message = eventoDelMesMessageBuilder(res, true);
            await broadcastMessage(message, standardMV2Options);
            logAction('✅ Scheduled monthly message sent');
        } catch (error) {
            logAction('❌ Failed to send scheduled monthly message:', error);
        }
    });

    const dailyCronExpression = '0 20 * * *'; // Everyday at 20:00
    cron.schedule(dailyCronExpression, async () => {
        try {
            const yesterdaysArticles = await (getYesterdaysPagesAndCreators());
            const oldStreak = streak;
            saveStreak(!!yesterdaysArticles.length);

            const newStreak = streak;
            const message = announceYesterdaysCreators(yesterdaysArticles, { newStreak, oldStreak });

            await broadcastMessage(message, standardMV2Options);
            logAction("✅ Yesterdays' creators sent");

        } catch (error) {
            console.error('❌ Something went wrong', error)
        }
    });

}

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    if (messageText == '/start' || messageText == '/start@wikiproyectolgbtbot') {
        bot.sendMessage(chatId, startMessage, standardMV2Options);
        logAction('✅ Start message sent');
    }

    if (messageText == '/help' || messageText == '/help@wikiproyectolgbtbot') {
        bot.sendMessage(chatId, helpMessage, standardMV2Options);
        logAction('✅ Help message sent');
    }

    if (messageText == '/eventodelmes' || messageText == '/eventodelmes@wikiproyectolgbtbot') {
        const res = await getCurrentEventoDelMesInfo();
        bot.sendMessage(chatId, eventoDelMesMessageBuilder(res, true), standardMV2Options);
        logAction('✅ Evento del mes response sent');
    }

    if (messageText == '/eventodelmesranking' || messageText == '/eventodelmesranking@wikiproyectolgbtbot') {
        const currentMonthObj: { month: Mes, year: string } = getCurrentMonthAndYear();
        const eventoInfo = await getEventoParticipantInfo(currentMonthObj.year, currentMonthObj.month);

        const rankedEditors = rankEditors(eventoInfo);
        const lesbianContributor = findTopLesbianBiographyContributors(eventoInfo);
        const currentEventoInfo = await getCurrentEventoDelMesInfo();

        const rankingMessage = eventoDelMesRankingMessageBuilder(rankedEditors, lesbianContributor, currentEventoInfo)
        bot.sendMessage(chatId, rankingMessage, standardMV2Options)
        logAction('✅ Sent out Evento del Mes ranking');
    }

    if (messageText == '/eventodelmesrankingpasado' || messageText == '/eventodelmesrankingpasado@wikiproyectolgbtbot') {
        const lastMonthObj: { month: Mes, year: string } = getLastMonthAndYear();
        const eventoInfo = await getEventoParticipantInfo(lastMonthObj.year, lastMonthObj.month);

        const lastRankedEditors = rankEditors(eventoInfo);
        const lastlesbianContributor = findTopLesbianBiographyContributors(eventoInfo);
        const lastEventoInfo = await getLastEventoDelMesInfo();

        const lastRankingMessage = lastEventoDelMesRankingBuilder(
            lastRankedEditors,
            lastlesbianContributor,
            lastEventoInfo
        );

        bot.sendMessage(chatId, lastRankingMessage, standardMV2Options);

        logAction('✅ Sent out last Evento del Mes ranking');

    }

    if (messageText == '/artículosayer' || messageText == '/articulosayer' || messageText == '/articulosayer@wikiproyectolgbtbot' || messageText == '/artículosayer@wikiproyectolgbtbot') {
        const yesterdaysArticles = await (getYesterdaysPagesAndCreators());
        bot.sendMessage(chatId, announceYesterdaysCreators(yesterdaysArticles), standardMV2Options);
    }

})

bot.on('my_chat_member', (msg) => {
    const chatId = msg.chat.id;
    const chatTitle = msg.chat.title || 'untitled';
    const newStatus = msg.new_chat_member.status;

    if (newStatus === 'member' || newStatus === 'administrator') {
        logAction(`🤖 Bot was added to group ${chatTitle}`)
        saveData({ group: chatTitle, chatId: chatId });
        bot.sendMessage(chatId, addedMessage, standardMV2Options);
    } else if (newStatus === 'left' || newStatus === 'kicked') {
        logAction(`👋 Bot was removed from group ${chatTitle}`)
        chatDictionary = chatDictionary.filter(chat => chat.chatId !== chatId);
        const idData = { groups: chatDictionary, streak };
        fs.writeFileSync(jsonFilePath, JSON.stringify(idData, null, 2), 'utf-8');
    }
})

bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id
    const chatTitle = msg.chat.title
    const newMembers = msg.new_chat_members

    if (newMembers) {
        if (!newMembers[0].is_bot) {
            const newMember = newMembers[0].username
            logAction(`❗ Greeting new member ${newMember} that was added to group ${chatTitle}`);
            bot.sendMessage(chatId, newMemberMessageBuilder(newMember || 'usuarie'), standardMV2Options)
        }
    }

})

fetchData();
scheduleMessages();