import {Command} from './command';
import TelegramBot from 'node-telegram-bot-api';
import {Api} from '../api';
import {renderPlayerLine} from '../rendering';

class TopDicksCommand extends Command {
  name = 'topdicks';
  description = 'Показати топ дрочерів.';
  isRegisteredOnly = true;

  async execute(msg: TelegramBot.Message, args: string[], api: Api) {
    const allPlayers = api.playersManager.getAllPlayers();
    const topPlayers = allPlayers.sort(
      (a, b) => b.getDickSize() - a.getDickSize(),
    );
    if (topPlayers.length === 0) {
      await api.replyTo(msg, 'Не достатньо гравців, щоб знайти актива.');
      return;
    }

    const topList = topPlayers.slice(0, 10);
    const output = topList
      .map((player, index) => renderPlayerLine(player, index))
      .join('\n');
    let output2 = `🧀 <b>Найкращі дрочери:</b>\n\n<code>${output}</code>`;
    if (topList.length !== topPlayers.length)
      output2 += `\n<i>Гравців не в таблиці: ${topPlayers.length - topList.length}</i>`;

    const bestFertilizer = topPlayers.reduce((prev, curr) => {
      return prev.getFertilizations() > curr.getFertilizations() ? prev : curr;
    });
    const bestCummer = topPlayers.reduce((prev, curr) => {
      return prev.getCums() > curr.getCums() ? prev : curr;
    });

    output2 += `\n\nЧастіше всього кінчає - ${bestFertilizer.getFirstName()}`;
    output2 += `\nЧастіше всього трахають - ${bestCummer.getFirstName()}`;
    await api.replyTo(msg, output2);
  }
}

export {TopDicksCommand};
