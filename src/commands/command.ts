import {CallbackQuery, Message} from 'node-telegram-bot-api';
import {Api} from '../api';

abstract class Command {
    abstract name: string;
    abstract description: string;
    isRegisteredOnly: boolean = true;
    isAdminOnly: boolean = false;

    abstract execute(msg: Message, args: string[], api: Api): Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async processCallback(query: CallbackQuery, api: Api): Promise<void> {}
}

export {Command};
