// Bot uses node-telegram-bot-api, docs at: https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md
// Bot messages are written in MarkdownV2 style, check https://core.telegram.org/bots/api#markdownv2-style

import { LGBTDaysDictionary } from './utils/lgbt-days';
import TelegramBot, { SendMessageOptions } from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { findTopLesbianBiographyContributors, getCurrentEventoDelMesInfo, getEventoDelMesInfoForMonth, getEventoParticipantInfo, getLastEventoDelMesInfo, getYesterdaysPagesAndCreators, rankEditors } from './services/mediawiki-service';
import { eventoDelMesMessageBuilder, addedMessage, lobbyAddedMessage, newMemberMessageBuilder, lobbyMemberMessageBuilder, startMessage, helpMessage, eventoDelMesRankingMessageBuilder, lastEventoDelMesRankingBuilder, specificEventoDelMesRankingBuilder, eventoRankingUsageMessage, noEventoDataMessageBuilder, announceYesterdaysCreators, lgbtDayMessageBuilder, LGBTDayPhase, errorMessageBuilder } from './utils/messages';
import { getCurrentMonthAndYear, getLastMonthAndYear, isLobbyGroup, logAction, normalizeMonth } from './utils/utils';
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
    // Make sure the data directory exists before any read/write. In Docker this is the mounted
    // volume, but locally (or on a fresh checkout) the folder may be missing, which would make the
    // writeFileSync below throw ENOENT.
    fs.mkdirSync(path.dirname(jsonFilePath), { recursive: true });
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
    fs.writeFileSync(jsonFilePath, JSON.stringify(idData, null, 2), 'utf-8');
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
    for (let name in LGBTDaysDictionary) {
        const event = LGBTDaysDictionary[name];
        const period = event.period ?? 'day';

        // Schedules a single broadcast for the given day of the observance's month.
        const scheduleDay = (dayOfMonth: number, phase: LGBTDayPhase) => {
            const cronExpression = `0 14 ${dayOfMonth.toString()} ${event.month.toString()} *`; // At 14:00 on the specified day and month
            cron.schedule(cronExpression, async () => {
                try {
                    const message = lgbtDayMessageBuilder(name, event, phase);
                    await broadcastMessage(message, legacyMarkdownOptions);
                    logAction(`✅ Scheduled ${name} (${phase}) message sent`)
                } catch (error) {
                    logAction(`❌ Failed to send scheduled ${name} message:`, error);
                }
            })
        };

        if (period === 'day') {
            // Single-day observances are announced on each of their days.
            event.days.forEach((dayOfMonth: number) => scheduleDay(dayOfMonth, 'single'));
        } else {
            // Weeks and months are announced only on their first ("comienza") and last ("termina") day.
            const firstDay = event.days[0];
            const lastDay = event.days[event.days.length - 1];
            scheduleDay(firstDay, 'start');
            if (lastDay !== firstDay) {
                scheduleDay(lastDay, 'end');
            }
        }
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

    const dailyCronExpression = '15 19 * * *'; // Everyday at 19:15
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

    // Split a command message into its command (without the optional @botname mention) and arguments,
    // so commands like /eventodelmesranking can accept parameters such as "junio 2024".
    const [commandToken, ...commandArgs] = (messageText ?? '').trim().split(/\s+/);
    const command = commandToken.split('@')[0];

    try {
        if (messageText == '/start' || messageText == '/start@wikiproyectolgbtbot') {
            bot.sendMessage(chatId, startMessage, standardMV2Options);
            logAction('✅ Start message sent');
        }

        if (command == '/help' || command == '/ayuda') {
            bot.sendMessage(chatId, helpMessage, standardMV2Options);
            logAction('✅ Help message sent');
        }

        if (messageText == '/eventodelmes' || messageText == '/eventodelmes@wikiproyectolgbtbot') {
            const res = await getCurrentEventoDelMesInfo();
            bot.sendMessage(chatId, eventoDelMesMessageBuilder(res, true), standardMV2Options);
            logAction('✅ Evento del mes response sent');
        }

        if (command == '/eventodelmesranking') {
            if (commandArgs.length === 0) {
                // No arguments: ranking for the current month (default behaviour)
                const currentMonthObj: { month: Mes, year: string } = getCurrentMonthAndYear();
                const eventoInfo = await getEventoParticipantInfo(currentMonthObj.year, currentMonthObj.month);

                const rankedEditors = rankEditors(eventoInfo);
                const lesbianContributor = findTopLesbianBiographyContributors(eventoInfo);
                const currentEventoInfo = await getCurrentEventoDelMesInfo();

                const rankingMessage = eventoDelMesRankingMessageBuilder(rankedEditors, lesbianContributor, currentEventoInfo)
                bot.sendMessage(chatId, rankingMessage, standardMV2Options)
                logAction('✅ Sent out Evento del Mes ranking');
            } else {
                // Arguments: ranking for a specific month and year, e.g. "/eventodelmesranking junio 2024"
                const month = normalizeMonth(commandArgs[0]);
                const year = commandArgs[1];

                if (!month || !/^\d{4}$/.test(year ?? '')) {
                    bot.sendMessage(chatId, eventoRankingUsageMessage, standardMV2Options);
                    logAction(`⚠️ Evento del Mes ranking: invalid arguments "${commandArgs.join(' ')}"`);
                } else {
                    const eventoInfo = await getEventoParticipantInfo(year, month);

                    if (eventoInfo.length === 0) {
                        bot.sendMessage(chatId, noEventoDataMessageBuilder(month, year), standardMV2Options);
                        logAction(`⚠️ No Evento del Mes data found for ${month} ${year}`);
                    } else {
                        const rankedEditors = rankEditors(eventoInfo);
                        const lesbianContributor = findTopLesbianBiographyContributors(eventoInfo);
                        const eventoDelMesInfo = await getEventoDelMesInfoForMonth(year, month);

                        const rankingMessage = specificEventoDelMesRankingBuilder(rankedEditors, lesbianContributor, eventoDelMesInfo, { month, year });
                        bot.sendMessage(chatId, rankingMessage, standardMV2Options);
                        logAction(`✅ Sent out Evento del Mes ranking for ${month} ${year}`);
                    }
                }
            }
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
    } catch (error) {
        // Surface the failure in the chat where the command was issued, with a brief explanation,
        // instead of failing silently as an unhandled rejection.
        const context = command.startsWith('/') ? `el comando ${command}` : 'tu mensaje';
        logAction(`❌ Error handling ${context}:`, error);
        try {
            await bot.sendMessage(chatId, errorMessageBuilder(error, context), standardMV2Options);
        } catch (notifyError) {
            // If the formatted notice itself can't be delivered (e.g. a parse issue), fall back to a
            // bare plain-text message so the chat is still told something went wrong.
            logAction('⚠️ Could not send the formatted error notice, retrying as plain text:', notifyError);
            try {
                await bot.sendMessage(chatId, '🤖💥 Uy... algo ha fallado y ni siquiera he podido contaros bien el error. Inténtalo otra vez en un ratito. Un besete de disculpa 🥀');
            } catch (plainError) {
                logAction('❌ Could not deliver the error notice to the chat:', plainError);
            }
        }
    }

})

bot.on('my_chat_member', (msg) => {
    const chatId = msg.chat.id;
    const chatTitle = msg.chat.title || 'untitled';
    const newStatus = msg.new_chat_member.status;

    if (newStatus === 'member' || newStatus === 'administrator') {
        logAction(`🤖 Bot was added to group ${chatTitle}`)
        saveData({ group: chatTitle, chatId: chatId });
        const introMessage = isLobbyGroup(chatTitle) ? lobbyAddedMessage : addedMessage;
        bot.sendMessage(chatId, introMessage, standardMV2Options);
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
            const welcomeMessage = isLobbyGroup(chatTitle)
                ? lobbyMemberMessageBuilder(newMember || 'usuarie')
                : newMemberMessageBuilder(newMember || 'usuarie');
            bot.sendMessage(chatId, welcomeMessage, standardMV2Options)
        }
    }

})

fetchData();
scheduleMessages();