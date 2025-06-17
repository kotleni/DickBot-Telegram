import { Command } from "./command";
import { Api } from "../api";
import { Message } from "node-telegram-bot-api";
import { getReplyMessageFromId } from "../utils";

class ShareCommand extends Command {
    name = "share";
    description = "Віддати частину пеніса гравцю.";
    isRegisteredOnly = true;

    async execute(msg: Message, args: string[], api: Api) {
        const amount = args[0];

        const userId = msg.from!.id.toString();
        const player = api.playersManager.getPlayer(userId)!;

        const opponentId = getReplyMessageFromId(msg)?.toString();
        if (opponentId === undefined || amount === undefined) {
            await api.replyTo(
                msg,
                "Відправте цю команду у відповідь на повідомлення та вкажіть кількість сантиметрів щоб передати їх. (ex: /share 20)",
            );
            return;
        }
        const opponent = api.playersManager.getPlayer(opponentId);

        const amountValue = parseInt(amount);

        if (player.getDickSize() < amountValue) {
            await api.replyTo(
                msg,
                `Щоб передати таку кількість сантиметрів - вам треба мати як мінімум ${amountValue} см прутня.`,
            );
            return;
        }

        player.cutDick(amountValue);
        opponent?.addDickSize(amountValue);
        api.playersManager.save();

        await api.replyTo(
            msg,
            `Передано ${amountValue} см гравцю ${opponent?.getFirstName()}!`,
        );
    }
}

export default ShareCommand;
