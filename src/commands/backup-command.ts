import {Command} from './command';
import {Api} from '../api';
import {Message} from 'node-telegram-bot-api';
import {getReplyMessageFromId} from '../utils';

class BackupCommand extends Command {
    name = 'backup';
    description = 'Backup data as json file.';

    async execute(msg: Message, args: string[], api: Api) {
        const player = api.playersManager.getPlayer(msg.from!.id.toString());
        const asJson = JSON.stringify(player?.getPlayerData() ?? {}, null, 2);

        const buffer = Buffer.from(asJson, 'utf-8');
        const messageOptions = {
            caption: 'Ось ваш бекап даних у форматі JSON.',
        };
        const fileOptions = {
            filename: `backup_${msg.from!.id}.json`,
            contentType: 'application/json',
        };
        await api.bot?.sendDocument(
            msg.chat.id,
            buffer,
            messageOptions,
            fileOptions,
        );
    }
}

export default BackupCommand;
