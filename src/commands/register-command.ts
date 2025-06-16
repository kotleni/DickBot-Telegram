import { Command } from "./command";
import { Message } from "node-telegram-bot-api";
import { Api } from "../api";

class RegisterCommand extends Command {
    name = "register";
    description = "Зареєструватися.";
    isRegisteredOnly = false;

    async execute(msg: Message, args: string[], api: Api) {
        const userId = msg.from!.id.toString();
        const player = api.playersManager.getPlayer(userId);
        if (player) {
            api.replyTo(msg, "Ви уже зареєстровані.");
            return;
        }

        const userName = msg.from!.username ?? msg.from!.id.toString();
        const firstName = msg.from!.first_name;
        const newPlayer = api.playersManager.createPlayer(
            userId,
            userName,
            firstName,
        );
        await api.replyTo(
            msg,
            `Ви зареєстровані, ${newPlayer.getFirstName()}!\n 😏 /dick - щоб грати.`,
        );
    }
}

export default RegisterCommand;
