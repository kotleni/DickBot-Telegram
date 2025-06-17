import { Command } from "./command";
import { Api } from "../api";
import { Message } from "node-telegram-bot-api";
import { getReplyMessageFromId } from "../utils";

class CumCommand extends Command {
    name = "cum";
    description = "Кінчити та спробувати поцілити у гравця.";
    isRegisteredOnly = true;

    async execute(msg: Message, args: string[], api: Api) {
        const userId = msg.from!.id.toString();

        const player = api.playersManager.getPlayer(userId)!;

        const opponentId = getReplyMessageFromId(msg)?.toString();
        if (opponentId === undefined) {
            await api.replyTo(
                msg,
                "Відправте цю команду у відповідь на повідомлення.",
            );
            return;
        }

        if (userId === opponentId && player?.getDickSize() < 200) {
            await api.replyTo(
                msg,
                "Вибач, але щоб кінчити на себе треба мати мімнімум 200 см прутня.",
            );
            return;
        }

        if (!player.isHaveDick()) {
            await api.replyTo(msg, "Вибач, але у тебе немає прутня.");
            return;
        }

        player.addScore(3);
        player.incrementCums();
        api.playersManager.save();

        const parts = [
            "лице",
            "руки",
            "ноги",
            "животик",
            "живіт",
            "член",
            "волосся",
            "спину",
            "локті",
            "телефон",
            "ноутбук",
            "ліжко",
            "стіл",
            "груди",
            "посуд",
            "чашку",
            "труси",
            "трусики",
            "сідниці",
            "шию",
            "щоки",
            "плечі",
            "соски",
            "коліна",
            "пальці",
            "пупок",
            "п'ятки",
            "клавіатуру",
            "мишку",
            "геймпад",
            "навушники",
            "монітор",
            "веб-камеру",
            "подушку",
            "ковдру",
            "дзеркало",
            "шкарпетки",
            "панчохи",
            "худі",
            "окуляри",
            "улюблену іграшку",
            "зубну щітку",
            "піцу",
            "енергетик",
            "бутерброд",
            "репутацію",
            "самооцінку",
            "плани на вихідні",
            "кота", // (звісно, жартома)
            "конспект з матаналізу",
        ];

        const distance = Math.round(Math.random() * 100);
        if (distance > 33) {
            const secondPlayer = api.playersManager.getPlayer(opponentId)!;
            const playerFirstName = player.getFirstName();
            const secondPlayerFirstName = secondPlayer.getFirstName();

            const playerLink = `<a href="tg://user?id=${player.getId()}">${playerFirstName}</a>`;
            const secondPlayerLink = `<a href="tg://user?id=${secondPlayer.getId()}">${secondPlayerFirstName}</a>`;

            const randomPart = parts[Math.floor(Math.random() * parts.length)];

            await api.replyTo(
                msg,
                `Жах! 😍\nГравець ${playerLink} обкінчав ${randomPart} гравця ${secondPlayerLink}.`,
            );
        } else {
            await api.replyTo(msg, `Мимо... Нікого не заділо...`);
        }
    }
}

export default CumCommand;
