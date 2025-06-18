import { Command } from "./command";
import { Message } from "node-telegram-bot-api";
import { Api } from "../api";
import { getReplyMessageFromId } from "../utils";

class FertilizeCommand extends Command {
    name = "fertilize";
    description = "Осіменити гравця.";
    isRegisteredOnly = true;

    async execute(msg: Message, args: string[], api: Api) {
        const player = api.playersManager.getPlayer(msg.from!.id.toString())!;

        const opponentId = getReplyMessageFromId(msg)?.toString();

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
        opponent?.addScore(2);

        player.addDickSize(cost);
        opponent?.addDickSize(cost);
        opponent?.incrementFertilizations();
        api.playersManager.save();

        await api.replyTo(
            msg,
            `🧬 Ви запліднили гравця ${opponent?.getFirstName()}!\n+2 см для обох прутнів...`,
        );
    }
}

export default FertilizeCommand;
