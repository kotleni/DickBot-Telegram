import {Command} from './command';
import {Api} from '../api';
import {Message} from 'node-telegram-bot-api';

// TODO: Add a lot of checks, this command was just speed-coded.
export class AdminCommand extends Command {
    name = 'admin';
    description = 'Керування ботом для адмінів.';

    private readonly adminOnlyWarningMessage = 'Ти не адмін.';
    private lastOwnCode: string = '';

    private generateCode(): string {
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    async execute(msg: Message, args: string[], api: Api) {
        function isFromAdmin(): boolean {
            return api.config.isAdmin(msg.from!.id.toString());
        }

        const command = args[0] ?? '';
        const player = api.playersManager.getPlayer(msg.from!.id.toString());

        if (command === 'get-code') {
            this.lastOwnCode = this.generateCode();
            console.log(`Requested admin code: /admin own ${this.lastOwnCode}`);
        } else if (command === 'own') {
            const code = args[1] ?? '';
            if (code === this.lastOwnCode) {
                api.config.promoteAdmin(msg.from!.id);
                await api.config.save();
                await api.replyTo(msg, 'Код вірний. Тепер ти адмін.');

                this.lastOwnCode = '';
            } else {
                await api.replyTo(msg, 'Код не вірний.');
            }
        } else if (command === 'promote') {
            if (!isFromAdmin()) {
                await api.replyTo(msg, this.adminOnlyWarningMessage);
                return;
            }

            const userId = msg.reply_to_message?.from?.id.toString();
            if (userId) {
                const replyPlayer = api.playersManager.getPlayer(userId);
                api.config.promoteAdmin(Number(userId));
                await api.config.save();
                await api.replyTo(
                    msg,
                    `${replyPlayer?.getFirstName()} тепер адмін.`,
                );
            } else {
                await api.replyTo(
                    msg,
                    'Відправте у відповідь на повідомлення.',
                );
            }
        } else if (command === 'demote') {
            if (!isFromAdmin()) {
                await api.replyTo(msg, this.adminOnlyWarningMessage);
                return;
            }

            const userId = msg.reply_to_message?.from?.id.toString();
            if (userId) {
                const replyPlayer = api.playersManager.getPlayer(userId);
                api.config.demoteAdmin(Number(userId));
                await api.config.save();
                await api.replyTo(
                    msg,
                    `${replyPlayer?.getFirstName()} тепер не адмін.`,
                );
            } else {
                await api.replyTo(
                    msg,
                    'Відправте у відповідь на повідомлення.',
                );
            }
        } else if (command === 'lock-group') {
            if (!isFromAdmin()) {
                await api.replyTo(msg, this.adminOnlyWarningMessage);
                return;
            }

            const chatId = msg.reply_to_message?.chat.id;
            api.config.addGroup(chatId!);
            await api.config.save();
            await api.replyTo(
                msg,
                `Цей бот тепер ${chatId} прикріпленний до цієї группи.`,
            );
        } else if (command === 'disable-command') {
            if (!isFromAdmin()) {
                await api.replyTo(msg, this.adminOnlyWarningMessage);
                return;
            }

            const commandName = args[1] ?? '';
            api.config.disableCommand(commandName);
            await api.config.save();
            await api.replyTo(msg, `Команда ${commandName} тепер відключена.`);
        } else if (command === 'enable-command') {
            if (!isFromAdmin()) {
                await api.replyTo(msg, this.adminOnlyWarningMessage);
                return;
            }

            const commandName = args[1] ?? '';
            api.config.enableCommand(commandName);
            await api.config.save();
            await api.replyTo(msg, `Команда ${commandName} тепер відключена.`);
        } else {
            await api.replyTo(
                msg,
                '/admin [get-code|own|promote|demote|lock-group|disable-command|enable-command]',
            );
        }
    }
}
