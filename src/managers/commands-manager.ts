import { PatCommand } from "../commands/pat-command";
import { Command } from "../commands/command";
import { Message } from "node-telegram-bot-api";
import { DicksGame } from "../dicks-game";
import BoobsCommand from "../commands/boobs-command";
import { TopDicksCommand } from "../commands/topdicks-command";

class CommandsManager {
    private commands: Command[] = [
        new PatCommand(),
        new BoobsCommand(),
        new TopDicksCommand(),
    ];

    processCommandMessage(msg: Message, dicksGame: DicksGame): void {
        this.commands.forEach((command) => {
            if (msg.text?.startsWith(`/${command.name}`)) {
                command.execute(
                    msg,
                    msg.text?.split(" ")?.slice(1) ?? [],
                    dicksGame,
                );
            }
        });
    }
}

export { CommandsManager };
