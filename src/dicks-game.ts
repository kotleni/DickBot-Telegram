import { CaseManager } from "./managers/cases-manager";
import { PlayersManager } from "./managers/players-manager";
import TelegramBot, { Message } from "node-telegram-bot-api";
import {
    renderCaseResult,
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
        this.replyTo(msg, `🧀 <b>Найкращі дрочери:</b>\n\n${output}`);
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

        const distance = Math.round(
            Math.random() * (player.getDickSize() * 3.3),
        );
        this.replyTo(
            msg,
            `Без відомих нікому причин ви кінчили на дистанцію в ${distance} см.`,
        );
        if (distance > 89) {
            this.replyTo(msg, `https://www.youtube.com/watch?v=j0lN0w5HVT8`);
        }
    }
}

export { DicksGame };
