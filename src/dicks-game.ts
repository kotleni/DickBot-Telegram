import {CaseManager} from './managers/cases-manager';
import {PlayersManager} from './managers/players-manager';
import TelegramBot, {Message} from 'node-telegram-bot-api';
import {CommandsManager} from './managers/commands-manager';
import {Api} from './api';
import * as dotenv from 'dotenv';
import {BotConfig} from './bot-config';

class DicksGame implements Api {
    readonly casesManager = new CaseManager();
    readonly playersManager = new PlayersManager();
    readonly commandsManager = new CommandsManager();
    readonly config = new BotConfig();
    bot: TelegramBot | undefined;

    async start() {
        dotenv.config();
        await this.config.load();

        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token)
            throw new Error('You need to setup .env for TELEGRAM_BOT_TOKEN.');

        this.bot = new TelegramBot(token ?? '', {polling: true});
        this.playersManager.init();
        this.playersManager.load();

        this.bot.on('polling_error', err => this.onPolingError(err));
        this.bot.onText(/\//, async msg => {
            const isBanned = this.config.isBanned(
                msg.from?.id.toString() ?? '',
            );
            const isGroupRegistered = this.config.isGroupAllowed(msg?.chat?.id);

            if (!isGroupRegistered) {
                await this.replyTo(
                    msg,
                    'Цей бот не прикріпленний до цієї группи.',
                );
                return;
            }

            // Ignore player is banned
            if (isBanned) {
                return;
            }

            const me = await this.bot?.getMe();
            if (msg.reply_to_message?.from?.id.toString() === me?.id.toString())
                return;

            await this.commandsManager.processCommandMessage(
                msg,
                this.config,
                this,
            );
        });
        this.bot.on('callback_query', async data => {
            const isBanned = this.config.isBanned(
                data.message?.from?.id.toString() ?? '',
            );

            // Ignore player is banned
            if (isBanned) {
                return;
            }

            await this.commandsManager.processCallback(data, this);
        });
    }

    async replyTo(msg: Message, text: string) {
        return this.bot?.sendMessage(msg.chat.id, text, {
            reply_to_message_id: msg.message_id,
            parse_mode: 'HTML',
        });
    }

    // private async replyUnregisteredWarning(msg: Message) {
    //   await this.replyTo(
    //     msg,
    //     'Ви не зареєстровані в системі.\n/register для реєстрації.',
    //   );
    // }

    private onPolingError(error: Error) {
        console.error(error);
        this.playersManager.disconnect();
    }
}

export {DicksGame};
