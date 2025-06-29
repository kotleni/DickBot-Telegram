import {Command} from './command';
import {Message} from 'node-telegram-bot-api';
import {Api} from '../api';
import {createWaifuService, WaifuService} from '../services/waifu-service';

const PAT_MESSAGES = [
    '🥺 {pattingPlayer} ніжно пестить {pattedPlayer}.',
    '✨ {pattingPlayer} гладить {pattedPlayer} по голівці. Як мило!',
    '❤️ {pattingPlayer} заспокійливо поплескує {pattedPlayer} по плечу.',
    '😌 {pattedPlayer} отримує порцію тепла від {pattingPlayer}.',
    '🥰 {pattingPlayer} дарує {pattedPlayer} дружній погладжунчик.',
];

class PatCommand extends Command {
    name = 'pat';
    description = 'Попестити гравця за допомогою картинки.';

    private waifuService: WaifuService = createWaifuService();

    async execute(msg: Message, args: string[], api: Api) {
        const pattingPlayerId = msg.from?.id.toString();
        if (!pattingPlayerId) return;

        const pattingPlayer = api.playersManager.getPlayer(pattingPlayerId);
        if (!pattingPlayer) return;

        const repliedToMsg = msg.reply_to_message;
        if (!repliedToMsg || !repliedToMsg.from) {
            await api.replyTo(
                msg,
                'Щоб когось попестити, відправте `/pat` у відповідь на його повідомлення.',
            );
            return;
        }

        const pattedPlayerId = repliedToMsg.from.id.toString();
        const botId = (await api.bot!.getMe()).id.toString();

        if (pattedPlayerId === pattingPlayerId) {
            await api.replyTo(
                msg,
                'Ви поплескали себе по плечу. Ви молодець! ✨',
            );
            return;
        }

        if (pattedPlayerId === botId) {
            await api.bot!.sendMessage(msg.chat.id, '🥰 *дякую, мур-мур*', {
                parse_mode: 'Markdown',
            });
            return;
        }

        const pattedPlayer = api.playersManager.getPlayer(pattedPlayerId);
        if (!pattedPlayer) {
            await api.replyTo(
                msg,
                'Ви спробували попестити таємничого незнайомця... але він зник у тумані.',
            );
            return;
        }

        try {
            const imageUrl = await this.waifuService.getPicture('sfw', 'pat');

            if (!imageUrl) {
                await api.replyTo(
                    msg,
                    'Ой, не вдалося знайти картинку для пестощів. Спробуйте пізніше.',
                );
                return;
            }

            let randomCaption =
                PAT_MESSAGES[Math.floor(Math.random() * PAT_MESSAGES.length)];

            randomCaption = randomCaption
                .replace('{pattingPlayer}', `*${pattingPlayer.getFirstName()}*`)
                .replace('{pattedPlayer}', `*${pattedPlayer.getFirstName()}*`);

            await api.bot?.sendPhoto(msg.chat.id, imageUrl, {
                caption: randomCaption,
                parse_mode: 'Markdown',
                reply_to_message_id: msg.message_id,
            });
        } catch (error) {
            console.error('Failed to fetch pat image or send photo:', error);
            await api.replyTo(
                msg,
                'Сталася помилка під час виконання команди. Можливо, сервіс картинок недоступний.',
            );
        }
    }
}

export {PatCommand};
