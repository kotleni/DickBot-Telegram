import {Command} from './command';
import {Message} from 'node-telegram-bot-api';
import {Api} from '../api';
import {renderPlayerProfile} from '../rendering';
import {getReplyMessageFromId} from '../utils';

class WhoisCommand extends Command {
    name = 'whois';
    description = 'Показати профіль гравця.';

    async execute(msg: Message, args: string[], api: Api) {
        const replyToUserId = getReplyMessageFromId(msg);
        const userId = (replyToUserId?.toString() ?? msg.from?.id.toString())!;

        const player = api.playersManager.getPlayer(userId);
        if (player === undefined) {
            await api.replyTo(msg, 'Цей гравець не зареєстрований.');
            return;
        }

        const output = renderPlayerProfile(player!);
        await api.replyTo(msg, output);
    }
}

export default WhoisCommand;
