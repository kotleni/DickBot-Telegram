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

class DicksGame {
    private casesManager = new CaseManager();
    private playersManager = new PlayersManager();
    private bot: TelegramBot | undefined;

    // Cooldown management properties
    private dickCommandCooldowns = new Map<string, number>();
    private readonly dickCommandCooldownDuration = 5 * 60 * 1000; // 5 minutes in ms

    start() {
        require("dotenv").config();
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token)
            throw new Error("You need to setup .env for TELEGRAM_BOT_TOKEN.");

        this.bot = new TelegramBot(token ?? "", { polling: true });
        this.playersManager.load();

        this.bot.on("polling_error", (err) => this.onPolingError(err));
        this.bot.onText(/\/register/, (msg) => this.onRegisterCommand(msg));
        this.bot.onText(/\/dick/, (msg) => this.onDickCommand(msg));
        this.bot.onText(/\/topdicks/, (msg) => this.onTopCommand(msg));
        this.bot.onText(/\/me/, (msg) => this.onMeCommand(msg));
        this.bot.onText(/\/cum/, (msg) => this.onCumCommand(msg));
        this.bot.onText(/\/duel/, (msg) => this.onDuelCommand(msg));
        this.bot.onText(/\/boobs/, (msg) => this.onBoobsCommand(msg));
        this.bot.on("callback_query", (data) => this.onCallbackQuery(data));
    }

    private replyTo(msg: Message, text: string) {
        this.bot?.sendMessage(msg.chat.id, text, {
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

    private onRegisterCommand(msg: Message) {
        if (!msg.from) return;

        const userId = msg.from.id.toString();
        const player = this.playersManager.getPlayer(userId);
        if (player) return this.replyTo(msg, "Ви уже зареєстровані.");

        const userName = msg.from.username ?? msg.from.id.toString();
        const firstName = msg.from.first_name;
        const newPlayer = this.playersManager.createPlayer(
            userId,
            userName,
            firstName,
        );
        this.replyTo(
            msg,
            `Ви зареєстровані, ${newPlayer.getFirstName()}!\n 😏 /dick - щоб грати.`,
        );
    }

    private onDickCommand(msg: Message) {
        if (!msg.from) return;

        const userId = msg.from.id.toString();

        const player = this.playersManager.getPlayer(userId);
        if (player === undefined) {
            this.replyUnregisteredWarning(msg);
            return;
        }

        // Cooldown
        const lastUsedTimestamp = this.dickCommandCooldowns.get(userId);
        if (lastUsedTimestamp) {
            const timeElapsed = Date.now() - lastUsedTimestamp;

            if (timeElapsed < this.dickCommandCooldownDuration) {
                const timeLeftMs =
                    this.dickCommandCooldownDuration - timeElapsed;
                const timeLeftSec = Math.ceil(timeLeftMs / 1000);
                this.replyTo(
                    msg,
                    `Терпіння, юний друже. Ви зможете чіпати прутня знову через <b>${timeLeftSec}</b> секунд.`,
                );
                return;
            }
        }

        // Update cooldown
        this.dickCommandCooldowns.set(userId, Date.now());

        player.addScore(1);

        const situationCase = this.casesManager.getRandomCase();
        player.addDickSize(situationCase.value);
        this.playersManager.save();

        const output = renderCaseResult(situationCase, player);
        this.replyTo(msg, output);
    }

    private onTopCommand(msg: Message) {
        if (!msg.from) return;

        const allPlayers = this.playersManager.getAllPlayers();
        const topPlayers = allPlayers.sort(
            (a, b) => b.getDickSize() - a.getDickSize(),
        );
        if (topPlayers.length === 0)
            return this.replyTo(
                msg,
                "Не достатньо гравців, щоб знайти актива.",
            );

        const topList = topPlayers.slice(0, 10);
        const output = topList
            .map((player, index) => renderPlayerLine(player, index))
            .join("\n");
        let output2 = `🧀 <b>Найкращі дрочери:</b>\n\n<code>${output}</code>`;
        if (topList.length != topPlayers.length)
            output2 += `\n<i>Гравців не в таблиці: ${topPlayers.length - topList.length}</i>`;
        this.replyTo(msg, output2);
    }

    private onMeCommand(msg: Message) {
        if (!msg.from) return;

        const userId = msg.from.id.toString();

        const player = this.playersManager.getPlayer(userId);
        if (player === undefined) {
            this.replyUnregisteredWarning(msg);
            return;
        }
        const output = renderPlayerProfile(player!!);
        this.replyTo(msg, output);
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

    private onBoobsCommand(msg: Message) {
        if (!msg.from) return;

        const player = this.playersManager.getPlayer(msg.from.id.toString());
        if (player === undefined) {
            this.replyUnregisteredWarning(msg);
            return;
        }

        const gender = player.getPlayerGender();
        const isFemboy = gender === "Фембой";

        if (isFemboy) {
            this.replyTo(
                msg,
                "🎯 Сьогодні свято, бо ваш член скоротився на 1 сантиметр!",
            );
            player.addDickSize(-1);
            this.playersManager.save();
        } else {
            this.replyTo(
                msg,
                "❌ Вибачте, але для виконання цієї команди вам необхідно мати груди.\n\nОдин із способів їх отримати - стати фембоєм.",
            );
        }
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
