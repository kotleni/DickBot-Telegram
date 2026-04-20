import {PatCommand} from '../commands/pat-command';
import {Command} from '../commands/command';
import {CallbackQuery, Message} from 'node-telegram-bot-api';
import {DicksGame} from '../dicks-game';
import BoobsCommand from '../commands/boobs-command';
import {TopDicksCommand} from '../commands/topdicks-command';
import WhoisCommand from '../commands/whois-command';
import RegisterCommand from '../commands/register-command';
import DickCommand from '../commands/dick-command';
import DuelCommand from '../commands/duel-command';
import FertilizeCommand from '../commands/fertilize-command';
import CumCommand from '../commands/cum-command';
import HelpCommand from '../commands/help-command';
import MasturbateCommand from '../commands/masturbate-command';
import InvCommand from '../commands/inv-command';
import ShareCommand from '../commands/share-command';
import {BotConfig} from '../bot-config';
import {Player} from '../player';
import {AdminCommand} from '../commands/admin-command';
import BackupCommand from '../commands/backup-command';

class CommandsManager {
    private commands: Command[] = [
        new HelpCommand(),
        new PatCommand(),
        new BoobsCommand(),
        new TopDicksCommand(),
        new WhoisCommand(),
        new RegisterCommand(),
        new DickCommand(),
        new DuelCommand(),
        new FertilizeCommand(),
        new CumCommand(),
        new MasturbateCommand(),
        new InvCommand(),
        new ShareCommand(),
        new AdminCommand(),
        new BackupCommand(),
    ];

    getAvailableCommands(): Command[] {
        return this.commands;
    }

    private canExecuteCommand(
        command: Command,
        player: Player | undefined,
        config: BotConfig,
    ): boolean {
        const isRegisteredCommand = command.isRegisteredOnly;
        const isAdminCommand = command.isAdminOnly;

        if (isRegisteredCommand && !player) return false;
        if (isAdminCommand && !config.isAdmin(player?.getId())) return false;
        if (config.isBlockedCommand(command.name)) return false;
        return true;
    }

    async processCommandMessage(
        msg: Message,
        config: BotConfig,
        dicksGame: DicksGame,
    ) {
        const player = dicksGame.playersManager.getPlayer(
            msg.from?.id.toString() ?? '',
        );
        const isPlayerRegistered = player !== undefined;

        for (const command of this.commands) {
            if (msg.text?.startsWith(`/${command.name}`)) {
                const isRequireBeRegistered = command.isRegisteredOnly;

                // Prevent use of command if require be registered and player not registered
                if (isRequireBeRegistered && !isPlayerRegistered) {
                    await dicksGame.replyTo(
                        msg,
                        'Для використання цієї команди вам потрібно зареєструватися.\n/register',
                    );
                    return;
                }

                // Prevent use of command if player not has permission to use it
                if (
                    !this.canExecuteCommand(
                        command,
                        dicksGame.playersManager.getPlayer(
                            msg.from?.id.toString() ?? '',
                        ),
                        config,
                    )
                ) {
                    await dicksGame.replyTo(
                        msg,
                        'Ви не можете використовувати цю команду.',
                    );
                    return;
                }

                // Finally - execute
                await command.execute(
                    msg,
                    msg.text?.split(' ')?.slice(1) ?? [],
                    dicksGame,
                );
            }
        }
    }

    async processCallback(query: CallbackQuery, dicksGame: DicksGame) {
        for (const command of this.commands) {
            // TODO: Filter commands
            await command.processCallback(query, dicksGame);
        }
    }
}

export {CommandsManager};
