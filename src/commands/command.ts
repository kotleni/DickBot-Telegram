import { DicksGame } from "../dicks-game";
import { Message } from "node-telegram-bot-api";
import { Api } from "../api";

abstract class Command {
    abstract name: string;
    abstract description: string;
    abstract isRegisteredOnly: boolean;

    abstract execute(msg: Message, args: string[], api: Api): Promise<void>;
}

export { Command };
