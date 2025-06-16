import { PatCommand } from "../commands/pat-command";
import { Command } from "../commands/command";
import { CallbackQuery, Message } from "node-telegram-bot-api";
import { DicksGame } from "../dicks-game";
import BoobsCommand from "../commands/boobs-command";
import { TopDicksCommand } from "../commands/topdicks-command";
import WhoisCommand from "../commands/whois-command";
import RegisterCommand from "../commands/register-command";
import DickCommand from "../commands/dick-command";
import DuelCommand from "../commands/duel-command";
import FertilizeCommand from "../commands/fertilize-command";
import CumCommand from "../commands/cum-command";

class CommandsManager {
    private commands: Command[] = [
        new PatCommand(),
        new BoobsCommand(),
        new TopDicksCommand(),
        new WhoisCommand(),
        new RegisterCommand(),
        new DickCommand(),
        new DuelCommand(),
        new FertilizeCommand(),
        new CumCommand(),
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

    processCallback(query: CallbackQuery, dicksGame: DicksGame): void {
        this.commands.forEach((command) => {
            // TODO: Filter commands
            command.processCallback(query, dicksGame);
        });
    }
}

export { CommandsManager };
