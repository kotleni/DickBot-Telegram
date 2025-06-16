import { Command } from "./command";
import { Api } from "../api";
import { Message } from "node-telegram-bot-api";

class CumCommand extends Command {
    name = "cum";
    description = "Кінчити та спробувати поцілити у гравця.";
    isRegisteredOnly = true;

    async execute(msg: Message, args: string[], api: Api) {
        const userId = msg.from!.id.toString();

        const player = api.playersManager.getPlayer(userId)!;

        if (!player.isHaveDick()) {
            await api.replyTo(msg, "Вибач, але у тебе немає прутня.");
            return;
        }

        player.addScore(3);
        api.playersManager.save();

        const distance = Math.round(Math.random() * 100);
        await api.replyTo(
            msg,
            `Без відомих нікому причин ви кінчили на дистанцію в ${distance} см.`,
        );
        if (distance > 89) {
            const secondPlayer = api.playersManager.getRandomPlayer();
            const playerFirstName = player.getFirstName();
            const secondPlayerFirstName = secondPlayer.getFirstName();

            const playerLink = `<a href="tg://user?id=${player.getId()}">${playerFirstName}</a>`;
            const secondPlayerLink = `<a href="tg://user?id=${secondPlayer.getId()}">${secondPlayerFirstName}</a>`;

            api.bot?.sendMessage(
                msg.chat.id,
                `Увага! 😍\nГравець ${playerLink} випадково обкінчав гравця ${secondPlayerLink}.`,
                { parse_mode: "HTML" },
            );
        }
    }
}

export default CumCommand;
