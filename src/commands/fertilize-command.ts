import { Command } from "./command";
import { Message } from "node-telegram-bot-api";
import { Api } from "../api";

class FertilizeCommand extends Command {
    name = "fertilize";
    description = "Осіменити гравця.";
    isRegisteredOnly = true;

    async execute(msg: Message, args: string[], api: Api) {
        const player = api.playersManager.getPlayer(msg.from!.id.toString())!;

        const opponentId = msg.reply_to_message?.from?.id.toString();

        if (opponentId === undefined) {
            await api.replyTo(
                msg,
                "Відправте /fertilize у відповідь на повідомлення.",
            );
            return;
        }

        const opponent = api.playersManager.getPlayer(opponentId!!);
        const requirement = 90;
        const cost = 1;

        if (player.getDickSize() < requirement) {
            await api.replyTo(
                msg,
                `Для того щоб запліднити когось - вам треба мати як мінімум ${requirement} см.`,
            );
            return;
        }

        player.addScore(18);
        player.incrementCums();
        opponent?.addScore(1);

        player.addDickSize(cost);
        opponent?.addDickSize(cost);
        opponent?.incrementFertilizations();
        api.playersManager.save();

        await api.replyTo(
            msg,
            `🧬 Ви запліднили гравця ${opponent?.getFirstName()}!\n+1 см для обох прутнів...`,
        );
    }
}

export default FertilizeCommand;
