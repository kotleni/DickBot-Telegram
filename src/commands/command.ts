import { DicksGame } from "../dicks-game";
import { CallbackQuery, Message } from "node-telegram-bot-api";
import { Api } from "../api";

abstract class Command {
    abstract name: string;
    abstract description: string;
    abstract isRegisteredOnly: boolean;

    abstract execute(msg: Message, args: string[], api: Api): Promise<void>;
    async processCallback(query: CallbackQuery, api: Api): Promise<void> {}
}

export { Command };
