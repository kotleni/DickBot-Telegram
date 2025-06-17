import { Command } from "./command";
import TelegramBot from "node-telegram-bot-api";
import { Api } from "../api";

class InvCommand extends Command {
    name = "inv";
    description = "Переглянути інвентар.";
    isRegisteredOnly = true;

    async execute(msg: TelegramBot.Message, args: string[], api: Api) {
        const player = api.playersManager.getPlayer(msg.from!.id.toString())!;
        const inventory = player.getItems();

        if (inventory.length === 0) {
            await api.replyTo(msg, "Ваш інвентар порожній.");
            return;
        }

        let output = "🖼 Ваш інвентар:\n\n";

        inventory.forEach((item) => {
            output += `${item.id} ${item.amount} шт\n`;
        });

        await api.replyTo(msg, output);
    }
}

export default InvCommand;
