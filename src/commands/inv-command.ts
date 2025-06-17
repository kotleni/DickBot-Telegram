import { Command } from "./command";
import TelegramBot from "node-telegram-bot-api";
import { Api } from "../api";
import { CatEars, getItemById } from "../items";

class InvCommand extends Command {
    name = "inv";
    description = "Переглянути інвентар.";
    isRegisteredOnly = true;

    async execute(msg: TelegramBot.Message, args: string[], api: Api) {
        const player = api.playersManager.getPlayer(msg.from!.id.toString())!;
        const inventory = player.getItems();

        if (inventory.length === 0) {
            await api.replyTo(msg, "Ваш інвентар порожній.");

            const item = CatEars;
            await api.replyTo(
                msg,
                `Гравець ${player.getFirstName()} отримав ${item.name} 1 шт.`,
            );

            player.addItem(item);
            api.playersManager.save();

            return;
        }

        let output = "🖼 Ваш інвентар:\n\n";

        inventory.forEach((inventoryItem) => {
            const item = getItemById(inventoryItem.id);
            if (!item) return;
            output += `${item.name} ${inventoryItem.amount} шт\n`;
        });

        await api.replyTo(msg, output);
    }
}

export default InvCommand;
