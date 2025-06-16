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
        this.bot.onText(/\/duel/, (msg) => this.onDuelCommand(msg));
        this.bot.onText(/\/fertilize/, (msg) => this.onFertilizeCommand(msg));
        this.bot.on("callback_query", (data) => this.onCallbackQuery(data));
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

    private onDuelCommand(msg: Message) {
        if (!msg.from) return;

        if (!msg.reply_to_message?.from) {
            this.replyTo(
                msg,
                "Для того щоб визвати когось на дуєль - відправте /duel у відповідь на повідомлення його.",
            );
            return;
        }

        const initiatorId = msg.from.id.toString();
        const opponentId = msg.reply_to_message.from?.id.toString();

        if (initiatorId === opponentId)
            return this.replyTo(
                msg,
                "Ви не можете визвати самого себе на дуєль.",
            );

        const initiator = this.playersManager.getPlayer(initiatorId);
        const opponent = this.playersManager.getPlayer(opponentId);

        if (initiator === undefined) {
            this.replyUnregisteredWarning(msg);
            return;
        }

        if (opponent === undefined) {
            this.replyTo(
                msg,
                "Опонент не зареєстрований в системі.\n/register для реєстрації.",
            );
            return;
        }

        const resultMessage = renderDuelStartResult(initiator!!, opponent!!);

        const kb: InlineKeyboardMarkup = {
            inline_keyboard: [
                [
                    {
                        text: `🤝 ${opponent!!.getFirstName()}`,
                        callback_data: `duel ${initiator!!.getId()} ${opponent!!.getId()}`,
                    },
                ],
            ],
        };

        this.bot?.sendMessage(msg.chat.id, resultMessage, {
            reply_to_message_id: msg.message_id,
            parse_mode: "HTML",
            reply_markup: kb,
        });
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

    private onCallbackQuery(data: CallbackQuery) {
        const callback_data = data.data;
        const parts = callback_data!!.split(" ");
        if (parts[0] !== "duel") return;

        const initiatorId = parts[1];
        const opponentId = parts[2];

        if (data.from.id.toString() !== opponentId) return;

        const players = [
            this.playersManager.getPlayer(initiatorId)!!,
            this.playersManager.getPlayer(opponentId)!!,
        ];
        const winnerIndex = Math.random() * players.length;
        const winner = players[Math.floor(winnerIndex)];

        const cost = Math.round(Math.random() * 50);

        players.forEach((player) => player.addScore(33));

        players.forEach((player) => {
            if (player == winner) player.addDickSize(cost);
            else player.addDickSize(-cost);
        });

        this.playersManager.save();

        const output = renderDuelEndResult(winner!!, players, cost);
        this.bot?.editMessageText(output, {
            chat_id: data.message?.chat.id,
            message_id: data.message?.message_id,
            parse_mode: "HTML",
        });

        this.replyTo(data.message!!, "🤝 Дуєль завершена.");
    }
}

export { DicksGame };
