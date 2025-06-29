import {Command} from './command';
import TelegramBot from 'node-telegram-bot-api';
import {Api} from '../api';
import {createWaifuService, WaifuService} from '../services/waifu-service';

class BoobsCommand extends Command {
  name = 'boobs';
  description = 'Получити випадкову аніме картинку.';

  private waifuService: WaifuService = createWaifuService();

  async execute(
    msg: TelegramBot.Message,
    args: string[],
    api: Api,
  ): Promise<void> {
    const category = args[1] ?? 'waifu';
    const type = args[2] ?? 'nsfw';

    const url = await this.waifuService.getPicture(type, category);
    await api.bot?.sendPhoto(msg.chat.id, url ?? '', {
      caption: '🤪',
      parse_mode: 'HTML',
      has_spoiler: true,
      reply_to_message_id: msg.message_id,
    });
  }
}

export default BoobsCommand;
