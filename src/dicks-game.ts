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
        this.bot.onText(/\/cum/, (msg) => this.onCumCommand(msg));
        this.bot.onText(/\/fertilize/, (msg) => this.onFertilizeCommand(msg));
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

    private onCumCommand(msg: Message) {
        if (!msg.from) return;

        const userId = msg.from.id.toString();

        const player = this.playersManager.getPlayer(userId);
        if (player === undefined) {
            this.replyUnregisteredWarning(msg);
            return;
        }

        if (!player.isHaveDick()) {
            return this.replyTo(msg, "Вибач, але у тебе немає прутня.");
        }

        player.addScore(3);
        this.playersManager.save();

        const distance = Math.round(Math.random() * 100);
        this.replyTo(
            msg,
            `Без відомих нікому причин ви кінчили на дистанцію в ${distance} см.`,
        );
        if (distance > 89) {
            const secondPlayer = this.playersManager.getRandomPlayer();
            const playerFirstName = player.getFirstName();
            const secondPlayerFirstName = secondPlayer.getFirstName();

            const playerLink = `<a href="tg://user?id=${player.getId()}">${playerFirstName}</a>`;
            const secondPlayerLink = `<a href="tg://user?id=${secondPlayer.getId()}">${secondPlayerFirstName}</a>`;

            this.bot?.sendMessage(
                msg.chat.id,
                `Увага! 😍\nГравець ${playerLink} випадково обкінчав гравця ${secondPlayerLink}.`,
                { parse_mode: "HTML" },
            );
        }
    }

    private onFertilizeCommand(msg: Message) {
        if (!msg.from) return;

        const player = this.playersManager.getPlayer(msg.from.id.toString());
        if (player === undefined) {
            this.replyUnregisteredWarning(msg);
            return;
        }

        const opponentId = msg.reply_to_message?.from?.id.toString();

        if (opponentId === undefined) {
            return this.replyTo(
                msg,
                "Відправте /fertilize у відповідь на повідомлення.",
            );
        }

        const opponent = this.playersManager.getPlayer(opponentId!!);
        const requirement = 90;
        const cost = 1;

        if (player.getDickSize() < requirement) {
            return this.replyTo(
                msg,
                `Для того щоб запліднити когось - вам треба мати як мінімум ${requirement} см.`,
            );
        }

        player.addScore(18);
        opponent?.addScore(1);

        player.addDickSize(cost);
        opponent?.addDickSize(cost);
        opponent?.incrementFertilizations();
        this.playersManager.save();

        this.replyTo(
            msg,
            `🧬 Ви запліднили гравця ${opponent?.getFirstName()}!\n+1 см для обох прутнів...`,
        );
    }
}

export { DicksGame };
