import {CallbackQuery, Message} from 'node-telegram-bot-api';
import {Api} from '../api';

abstract class Command {
  abstract name: string;
  abstract description: string;
  abstract isRegisteredOnly: boolean;

  abstract execute(msg: Message, args: string[], api: Api): Promise<void>;
  async processCallback(query: CallbackQuery, api: Api): Promise<void> {
    console.log(
      `${query.from?.username} used callback ${query?.data?.toString()} in ${this.name}`,
    );
    await api.bot?.answerInlineQuery(query.id, []);
  }
}

export {Command};
