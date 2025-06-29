import {Command} from './command';
import {Message} from 'node-telegram-bot-api';
import {Api} from '../api';

class MasturbateCommand extends Command {
    name = 'masturbate';
    description = 'Зайнятися дрочкою.';

    // Cooldown management properties
    private dickCommandCooldowns = new Map<string, number>();
    private readonly dickCommandCooldownDuration = 25 * 60 * 1000; // 25 minutes in ms

    private targets: string[] = [
        // Класика
        'аніме',
        'хентай',
        'звичайне порно',
        'бдсм порно',
        'хентай з трапами',
        'фуррі-арт',
        'косплей',
        'хентай з тентаклями',

        // Люди та фетиші
        'трапів',
        'фембоїв',
        'чоловіків',
        'жінок',
        'транс-дівчат',
        'транс-хлопців',
        'небінарних персон',
        "м'язистих атлетів",
        'готичних дівчат',
        'свого відображення в дзеркалі',
        'жмж',
        'мжм',
        'фут-фетиш відео',
        'АСМР для дорослих',

        // Абстрактні та гік-теми
        'ідеально відформатований код',
        'скріншот свого neofetch',
        'успішний деплой на прод',
        'спогади про минулий секс',
        'отриману вчора похвалу',
        'звук відкриття банки енергетика',
        'схему бази даних',
        'рідкісну ачівку в Steam',
    ];

    private locations: string[] = [
        // Вдома
        'в кімнаті',
        'на кухні',
        'на підлозі',
        'на ліжку',
        'в туалеті',
        'в душі',
        "перед комп'ютером",
        'на балконі',
        'в кріслі',
        'у шафі, ховаючись',

        // Ризиковані та фентезійні
        'у громадському транспорті',
        'в бібліотеці університету',
        'у серверній кімнаті',
        'на даху будинку',
        'у наметі під час походу',
        'у примірочній магазину одягу',
        'у віртуальному світі VRChat',
    ];

    private weares: string[] = [
        // Класика
        'повністю роздягнешся',
        'будеш в одних трусах',
        'одягнеш спідницю',
        'одягнеш панчохи',
        'одягнеш лише шкарпетки',

        // Нові варіанти
        'одягнеш улюблену худі',
        'накинеш на себе ковдру',
        'одягнеш нашийник-чокер',
        'вдягнеш костюм покоївки',
        'вдягнеш котячі вушка',
        'обмотаєшся гірляндою',
        'вдягнеш шкіряну портупею',
        'вдягнеш лише ігрові навушники',
        'вдягнеш діловий костюм',
        'вдягнеш повний комплект броні',
    ];

    private stepsMessages: string[] = [
        // Короткі
        'Успіх...',
        'Насолода...',
        'Оооо....',
        'Так-так...',
        'Майже...',
        'Ще трохи...',

        // Описові
        'По тілу пробігає тремтіння...',
        'Дихання стає частішим...',
        'Світ навколо зникає...',
        'Серце калатає все сильніше...',
        'Ти на межі...',

        // Ігрові/IT
        'Калібрування системи...',
        'CPU навантажено на 99%...',
        'Компіляція задоволення...',
        'Основна гармата готова до пострілу...',
        'Усі системи в нормі...',

        // Жартома
        'Здається, сусіди все чують...',
        'Мої предки мною пишаються...',
    ];

    private getRandomFromArray(array: string[]) {
        return array[Math.floor(Math.random() * array.length)];
    }

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
                    `Терпіння, юний друже. Ви зможете зайнятися МаСтУрБаЦіЄю прутня знову через <b>${timeLeftSec}</b> секунд.`,
                );
                return;
            }
        }

        // Update cooldown
        this.dickCommandCooldowns.set(userId, Date.now());

        player.addScore(50);
        api.playersManager.save();

        // Change of unability to do it
        if (Math.random() < 0.4) {
            await api.replyTo(msg, '🚫 Нажаль у тебе нічого не вийшло...');
            return;
        }

        const delay = 1500;

        let buffer = '';
        const message = await api.replyTo(msg, '⚡️ Починаємо процедуру...');
        async function addMessage(
            text: string,
            isAddTripleDots: boolean = true,
        ) {
            buffer += `\n${text}`;
            await api.bot?.editMessageText(
                buffer + (isAddTripleDots ? '\n...' : ''),
                {
                    chat_id: message!.chat.id,
                    message_id: message!.message_id,
                },
            );
        }

        const epohes = 2 + Math.floor(Math.random() * 4);
        const cumsCount = 1 + Math.floor(Math.random() * 5);
        const stopsCount = 1 + Math.floor(Math.random() * 10);
        const dickSizeImpact = 1 + Math.floor(Math.random() * 10);

        const target = this.getRandomFromArray(this.targets);
        const location = this.getRandomFromArray(this.locations);
        const wear = this.getRandomFromArray(this.weares);

        await new Promise(resolve => setTimeout(resolve, delay));
        await addMessage(
            `[🎯]\nТвоя ціль це мастурбація на ${target}.\nТи будеш робити це ${location}.\nТи ${wear}.\n\nПочнемо! Це займе ${epohes} єтапів.`,
        );

        await new Promise(resolve => setTimeout(resolve, delay * 3));

        for (let epoh = 0; epoh < epohes; epoh++) {
            const step = this.getRandomFromArray(this.stepsMessages);

            await new Promise(resolve => setTimeout(resolve, delay));
            await addMessage(`${step} (${epoh + 1}/${epohes})`);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        await addMessage(
            `\n✅ Ти завершив мастурбацію.\n\nРазів кінчив: ${cumsCount}\nРазів зупинявся: ${stopsCount}\nЧлен збільшився на ${dickSizeImpact} см`,
            false,
        );

        // Update player stats
        player.addDickSize(dickSizeImpact);
        for (let i = 0; i < cumsCount; i++) {
            player.incrementCums();
        }
        player.addScore(stopsCount);
        api.playersManager.save();
    }
}

export default MasturbateCommand;
