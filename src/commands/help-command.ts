import {Command} from './command';
import {Message} from 'node-telegram-bot-api';
import {Api} from '../api';

class HelpCommand extends Command {
  name = 'help';
  description = 'Показати список команд.';
  isRegisteredOnly = false;

  async execute(msg: Message, args: string[], api: Api) {
    const commands = api.commandsManager.getAvailableCommands();
    let output = '📕 Список команд:\n\n';

    commands.forEach(command => {
      output += `/${command.name} - ${command.description}\n`;
    });

    await api.replyTo(msg, output);
  }
}

export default HelpCommand;
