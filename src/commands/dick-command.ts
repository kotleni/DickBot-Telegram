import {Command} from './command';
import {renderCaseResult} from '../rendering';
import {Message} from 'node-telegram-bot-api';
import {Api} from '../api';

class DickCommand extends Command {
    name = 'dick';
    description = 'Погратися з прутнем.';

    // Cooldown management properties
    private dickCommandCooldowns = new Map<string, number>();
    private readonly dickCommandCooldownDuration = 5 * 60 * 1000; // 5 minutes in ms

    async execute(msg: Message, args: string[], api: Api) {
        const userId = msg.from!.id.toString();

        const player = api.playersManager.getPlayer(userId)!;

        // Cooldown
        const lastUsedTimestamp = this.dickCommandCooldowns.get(userId);
        if (lastUsedTimestamp) {
            const timeElapsed = Date.now() - lastUsedTimestamp;

            if (timeElapsed < this.dickCommandCooldownDuration) {
                const timeLeftMs =
                    this.dickCommandCooldownDuration - timeElapsed;
                const timeLeftSec = Math.ceil(timeLeftMs / 1000);
                await api.replyTo(
                    msg,
                    `Терпіння, юний друже. Ви зможете чіпати прутня знову через <b>${timeLeftSec}</b> секунд.`,
                );
                return;
            }
        }

        // Update cooldown
        this.dickCommandCooldowns.set(userId, Date.now());

        player.addScore(1);
        player.incrementCums();

        const situationCase = api.casesManager.getRandomCase();
        player.addDickSize(situationCase.value);
        api.playersManager.save();

        const output = renderCaseResult(situationCase, player);
        await api.replyTo(msg, output);
    }
}

export default DickCommand;
