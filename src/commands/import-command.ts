import {Command} from './command';
import {Api} from '../api';
import {Message} from 'node-telegram-bot-api';
import {PlayerData} from '../player';

class ImportCommand extends Command {
    name = 'import';
    description = 'Import player data from a JSON file.';

    async execute(msg: Message, args: string[], api: Api) {
        const chatId = msg.chat.id;
        const userId = msg.from?.id.toString();

        if (!userId) return;

        const document = msg.document || msg.reply_to_message?.document;

        if (!document) {
            await api.bot?.sendMessage(
                chatId,
                'Будь ласка, надішліть JSON файл із командою /import у підписі, або дайте відповідь цією командою на файл.',
            );
            return;
        }

        if (!document.file_name?.endsWith('.json')) {
            await api.bot?.sendMessage(
                chatId,
                'Помилка: Файл повинен бути у форматі .json',
            );
            return;
        }

        try {
            const fileLink = await api.bot?.getFileLink(document.file_id);
            if (!fileLink) throw new Error('Could not get file link');

            const response = await fetch(fileLink);
            if (!response.ok) throw new Error('Failed to download file');

            const rawData = await response.text();
            const importedData = JSON.parse(rawData) as PlayerData;

            if (!importedData.firstName) {
                throw new Error('Invalid JSON structure: missing firstName');
            }

            await api.playersManager.importPlayerData(userId, importedData);

            await api.bot?.sendMessage(
                chatId,
                '✅ Дані успішно імпортовано та збережено у Redis!',
            );
        } catch (error) {
            console.error('Import error:', error);
            await api.bot?.sendMessage(
                chatId,
                `❌ Помилка імпорту: ${error instanceof Error ? error.message : 'Невідома помилка'}`,
            );
        }
    }
}

export default ImportCommand;
