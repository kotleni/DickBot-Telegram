import { Command } from "./command";
import TelegramBot from "node-telegram-bot-api";
import { Api } from "../api";
import { createWaifuService, WaifuService } from "../services/WaifuService";

class BoobsCommand extends Command {
    name = "boobs";
    description = "Получити випадкову аніме картинку.";
    isRegisteredOnly = true;

    private waifuService: WaifuService = createWaifuService();

    async execute(
        msg: TelegramBot.Message,
        args: string[],
        api: Api,
    ): Promise<void> {
        const category = args[1] ?? "cuddle";
        const type = args[2] ?? "sfw";

        const player = api.playersManager.getPlayer(msg.from?.id.toString()!!);

        const url = await this.waifuService.getPicture(type, category);
        api.bot?.sendPhoto(msg.chat.id, url ?? "", {
            caption: `🤪`,
            parse_mode: "HTML",
            has_spoiler: true,
        });
    }
}

export default BoobsCommand;
