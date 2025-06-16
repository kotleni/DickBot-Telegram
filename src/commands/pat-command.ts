import { Command } from "./command";
import { DicksGame } from "../dicks-game";
import { Message } from "node-telegram-bot-api";
import { Api } from "../api";

class PatCommand extends Command {
    name = "pat";
    description = "Попестити гравця.";
    isRegisteredOnly = false;

    async execute(msg: Message, args: string[], api: Api) {
        const player = api.playersManager.getPlayer(
            msg.from?.id.toString() ?? "",
        );
        if (player === undefined) return;
        const opponentId = msg.reply_to_message?.from?.id;

        if (opponentId === undefined) {
            await api.replyTo(
                msg,
                "Відправте /pat у відповідь на повідомлення його.",
            );
            return;
        }

        const opponent = api.playersManager.getPlayer(
            msg.reply_to_message?.from?.id.toString() ?? "",
        );

        await api.replyTo(
            msg,
            `🥺 Гравець ${player?.getFirstName()} попестив ${opponent?.getFirstName()}.`,
        );
    }
}

export { PatCommand };
