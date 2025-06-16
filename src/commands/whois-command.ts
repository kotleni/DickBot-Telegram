import { Command } from "./command";
import { Message } from "node-telegram-bot-api";
import { Api } from "../api";
import { renderPlayerProfile } from "../rendering";

class WhoisCommand extends Command {
    name = "whois";
    description = "Показати профіль гравця.";
    isRegisteredOnly = true;

    async execute(msg: Message, args: string[], api: Api) {
        const userId = (msg.reply_to_message?.from?.id?.toString() ??
            msg.from?.id.toString())!!;

        const player = api.playersManager.getPlayer(userId);
        if (player === undefined) return;

        const output = renderPlayerProfile(player!!);
        await api.replyTo(msg, output);
    }
}

export default WhoisCommand;
