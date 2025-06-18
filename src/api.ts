import {CaseManager} from './managers/cases-manager';
import {PlayersManager} from './managers/players-manager';
import {CommandsManager} from './managers/commands-manager';
import TelegramBot, {Message} from 'node-telegram-bot-api';

interface Api {
  casesManager: CaseManager;
  playersManager: PlayersManager;
  commandsManager: CommandsManager;
  bot: TelegramBot | undefined;

  replyTo(msg: Message, text: string): Promise<Message | undefined>;
}

export {Api};
