import {Command} from './command';
import {Message} from 'node-telegram-bot-api';
import {Api} from '../api';
import {getReplyMessageFromId} from '../utils';

class PatCommand extends Command {
    name = 'pat';
    description = 'Попестити гравця.';

    async execute(msg: Message, args: string[], api: Api) {
        const player = api.playersManager.getPlayer(
            msg.from?.id.toString() ?? '',
        );
        if (player === undefined) return;
        const opponentId = getReplyMessageFromId(msg)?.toString();

        if (opponentId === undefined) {
            await api.replyTo(
                msg,
                'Відправте /pat у відповідь на повідомлення його.',
            );
            return;
        }

        const opponent = api.playersManager.getPlayer(opponentId);

        await api.replyTo(
            msg,
            `🥺 Гравець ${player?.getFirstName()} попестив ${opponent?.getFirstName()}.`,
        );
    }
}

export {PatCommand};
