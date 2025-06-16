import { CaseManager } from "./managers/cases-manager";
import { PlayersManager } from "./managers/players-manager";
import TelegramBot, {
    CallbackQuery,
    InlineKeyboardMarkup,
    Message,
} from "node-telegram-bot-api";
import {
    renderCaseResult,
    renderDuelEndResult,
    renderDuelStartResult,
    renderPlayerLine,
    renderPlayerProfile,
} from "./rendering";
import { CommandsManager } from "./managers/commands-manager";
import { Api } from "./api";

class DicksGame implements Api {
    casesManager = new CaseManager();
    playersManager = new PlayersManager();
    commandsManager = new CommandsManager();
    bot: TelegramBot | undefined;

    start() {
        require("dotenv").config();
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token)
            throw new Error("You need to setup .env for TELEGRAM_BOT_TOKEN.");

        this.bot = new TelegramBot(token ?? "", { polling: true });
        this.playersManager.load();

        this.bot.on("polling_error", (err) => this.onPolingError(err));
        this.bot.onText(/\//, async (msg) => {
            const me = await this.bot?.getMe();
            if (msg.reply_to_message?.from?.id.toString() === me?.id.toString())
                return;

            this.commandsManager.processCommandMessage(msg, this);
        });
        this.bot.on("callback_query", async (data) => {
            this.commandsManager.processCallback(data, this);
        });
    }

    async replyTo(msg: Message, text: string) {
        return this.bot?.sendMessage(msg.chat.id, text, {
            reply_to_message_id: msg.message_id,
            parse_mode: "HTML",
        });
    }

    private replyUnregisteredWarning(msg: Message) {
        this.replyTo(
            msg,
            "Ви не зареєстровані в системі.\n/register для реєстрації.",
        );
    }

    private onPolingError(error: Error) {
        console.error(error);
    }
}

export { DicksGame };
