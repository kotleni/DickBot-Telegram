import TelegramBot from "node-telegram-bot-api";
import * as fs from "fs";
import * as path from "path";
import { getRandomCase } from "./cases";

interface PlayerData {
    name: string;
    treeSize: number;
}

type UserCollection = Record<string, PlayerData>;

class TreeGame {
    dataFilePath: string;
    userData: UserCollection;
    cooldowns: Map<number, number>;
    cooldownDuration: number;

    constructor(dataFilePath: string) {
        this.dataFilePath = dataFilePath;
        this.userData = this.loadData();
        this.cooldowns = new Map();
        this.cooldownDuration = 5 * 60 * 1000;
    }

    private loadData(): UserCollection {
        try {
            if (!fs.existsSync(this.dataFilePath)) {
                return {};
            }
            const rawData = fs.readFileSync(this.dataFilePath, "utf8");
            return JSON.parse(rawData);
        } catch (error) {
            console.warn(
                "Помилка завантаження players.json, створюю нові дані.",
                error,
            );
            return {};
        }
    }

    private saveData(): void {
        try {
            const json = JSON.stringify(this.userData, null, 2);
            fs.writeFileSync(this.dataFilePath, json, "utf8");
        } catch (error) {
            console.error("Помилка збереження даних:", error);
        }
    }

    getUserTreeSize(userId: number): number {
        return this.userData[String(userId)]
            ? this.userData[String(userId)].treeSize
            : 16;
    }

    setUserTreeSize(userId: number, name: string, size: number): void {
        const userIdStr = String(userId);
        if (!this.userData[userIdStr]) {
            this.userData[userIdStr] = { name: name, treeSize: 16 };
        }
        this.userData[userIdStr].name = name; // Оновлюємо ім'я на випадок, якщо користувач його змінив
        this.userData[userIdStr].treeSize = size;
        this.saveData();
    }

    canUseDickCommand(userId: number): boolean {
        const lastUsed = this.cooldowns.get(userId);
        if (!lastUsed) {
            return true;
        }
        return Date.now() - lastUsed >= this.cooldownDuration;
    }

    setDickCommandCooldown(userId: number): void {
        this.cooldowns.set(userId, Date.now());
    }

    cutPenis(userId: number, name: string): void {
        const currentSize = this.getUserTreeSize(userId);
        this.setUserTreeSize(userId, name, currentSize - 1);
    }

    grow(userId: number, name: string, growth: number): number {
        const currentSize = this.getUserTreeSize(userId);
        this.setUserTreeSize(userId, name, currentSize + growth);
        return growth;
    }

    getTopPlayers(): PlayerData[] {
        return Object.values(this.userData).sort(
            (a, b) => b.treeSize - a.treeSize,
        );
    }
}

require("dotenv").config();
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    throw new Error("You need to setup .env for TELEGRAM_BOT_TOKEN.");
}

const bot = new TelegramBot(token, { polling: true });
const DATA_FILE = path.join("./", "players.json");
const treeGame = new TreeGame(DATA_FILE);

console.log("Bot started...");

bot.onText(/\/dick/, (msg) => {
    if (!msg.from) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.first_name;

    const actualSize = treeGame.getUserTreeSize(userId);

    if (!treeGame.canUseDickCommand(userId)) {
        const lastUsed = treeGame.cooldowns.get(userId) || 0;
        const timeLeft = Math.ceil(
            (treeGame.cooldownDuration - (Date.now() - lastUsed)) / 1000,
        );
        bot.sendMessage(
            chatId,
            `Ви зможете виміряти свій пеніс (зараз: ${actualSize} см) знову через ${timeLeft} секунд.`,
        );
        return;
    }

    treeGame.setDickCommandCooldown(userId);

    const situationCase = getRandomCase();
    const situationValue = situationCase.value;

    treeGame.grow(userId, userName, situationValue);
    const newSize = treeGame.getUserTreeSize(userId);

    let growthMessage = situationCase.message;
    if (situationValue > 0) growthMessage += `\n+ ${situationValue} см`;
    if (situationValue < 0)
        growthMessage += `\n- ${Math.abs(situationValue)} см`;
    bot.sendMessage(
        chatId,
        `${growthMessage}\n\nВаш пеніс тепер <b>${newSize}</b> см.`,
        { parse_mode: "HTML", reply_to_message_id: msg.message_id },
    );
});

bot.onText(/\/topdicks/, (msg) => {
    const chatId = msg.chat.id;
    const topPlayers = treeGame.getTopPlayers();

    let text = "<b>Топ пенісів:</b>\n\n";
    const topList = topPlayers.slice(0, 10); // Беремо перші 10

    if (topList.length === 0) {
        text += "Ще ніхто не грав. Будь першим, напиши /dick!";
    } else {
        topList.forEach((player, i) => {
            let emoji = "";
            if (i === 0) emoji = "👑"; // Король
            if (i === 1) emoji = "🥈";
            if (i === 2) emoji = "🥉";
            text += `${i + 1}. ${emoji} ${player.name}: <b>${player.treeSize}</b> см\n`;
        });
    }

    bot.sendMessage(chatId, text, { parse_mode: "HTML" });
});

bot.onText(/азік/i, (msg) => {
    if (!msg.from) return;
    const userId = msg.from.id;
    const userName = msg.from.first_name;
    treeGame.cutPenis(userId, userName);
    bot.sendMessage(
        msg.chat.id,
        "Хто такий Азік? Ваш пеніс, здається, зменшився... (-1 см)",
        { reply_to_message_id: msg.message_id },
    );
});

bot.onText(/калібровка/i, (msg) => {
    if (!msg.from) return;
    const userId = msg.from.id;
    const currentSize = treeGame.getUserTreeSize(userId);
    bot.sendMessage(
        msg.chat.id,
        `<b>Калібровка пройшла успішно.</b>\nРозмір пенісу не змінився. ✨\nПоточний розмір: ${currentSize} см`,
        { parse_mode: "HTML", reply_to_message_id: msg.message_id },
    );
});
