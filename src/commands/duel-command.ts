import TelegramBot, {
  InlineKeyboardMarkup,
  Message,
} from 'node-telegram-bot-api';
import {Command} from './command';
import {Api} from '../api';
import {renderDuelEndResult, renderDuelStartResult} from '../rendering';
import {getReplyMessageFromId} from '../utils';

class DuelCommand extends Command {
  name = 'duel';
  description = 'Запросити гравця на дуель.';

  async execute(msg: Message, args: string[], api: Api) {
    if (!msg.reply_to_message?.from) {
      await api.replyTo(
        msg,
        'Для того щоб визвати когось на дуєль - відправте /duel у відповідь на повідомлення його.',
      );
      return;
    }

    const initiatorId = msg.from!.id.toString();
    const opponentId = getReplyMessageFromId(msg)?.toString();

    if (initiatorId === opponentId) {
      await api.replyTo(msg, 'Ви не можете визвати самого себе на дуєль.');
      return;
    }

    const initiator = api.playersManager.getPlayer(initiatorId);
    const opponent = api.playersManager.getPlayer(opponentId!);

    if (opponent === undefined) {
      await api.replyTo(
        msg,
        'Опонент не зареєстрований в системі.\n/register для реєстрації.',
      );
      return;
    }

    const resultMessage = renderDuelStartResult(initiator!, opponent!);

    const kb: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: `🤝 ${opponent!.getFirstName()}`,
            callback_data: `duel ${initiator!.getId()} ${opponent!.getId()}`,
          },
        ],
      ],
    };

    await api.bot?.sendMessage(msg.chat.id, resultMessage, {
      reply_to_message_id: msg.message_id,
      parse_mode: 'HTML',
      reply_markup: kb,
    });
  }

  async processCallback(
    query: TelegramBot.CallbackQuery,
    api: Api,
  ): Promise<void> {
    const callback_data = query.data;
    const parts = callback_data!.split(' ');
    if (parts[0] !== 'duel') return;

    const initiatorId = parts[1];
    const opponentId = parts[2];

    if (query.from.id.toString() !== opponentId) return;

    const players = [
      api.playersManager.getPlayer(initiatorId)!,
      api.playersManager.getPlayer(opponentId)!,
    ];
    const winnerIndex = Math.random() * players.length;
    const winner = players[Math.floor(winnerIndex)];

    const cost = Math.round(Math.random() * 25);

    players.forEach(player => player.addScore(33));

    players.forEach(player => {
      if (player === winner) player.addDickSize(cost);
      else player.addDickSize(-cost);

      player.incrementCums();
    });

    api.playersManager.save();

    const output = renderDuelEndResult(winner!, players, cost);
    await api.bot?.editMessageText(output, {
      chat_id: query.message?.chat.id,
      message_id: query.message?.message_id,
      parse_mode: 'HTML',
    });

    await api.replyTo(query.message!, '🤝 Дуєль завершена.');

    return super.processCallback(query, api);
  }
}

export default DuelCommand;
