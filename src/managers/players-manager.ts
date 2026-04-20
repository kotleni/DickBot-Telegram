import {createPlayer, createPlayerData, Player, PlayerData} from '../player';
import {createClient, RedisClientType} from 'redis';
import 'dotenv/config';

type UserCollection = Record<string, PlayerData>;

class PlayersManager {
    private client: RedisClientType;
    private readonly REDIS_KEY: string = 'players:v2';
    private players: Player[] = [];

    constructor() {
        const {REDIS_USER, REDIS_PASSWORD, REDIS_HOST, REDIS_PORT} =
            process.env;

        // Construct URL: redis://user:password@host:port
        const url = `redis://${REDIS_USER}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`;

        console.log('Connecting to Redis with URL:', url);

        this.client = createClient({url});

        this.client.on('error', err =>
            console.error('Redis Client Error', err),
        );
    }

    async init(): Promise<void> {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
        await this.load();
    }

    async importPlayerData(userId: string, data: PlayerData): Promise<void> {
        const playerIndex = this.players.findIndex(p => p.getId() === userId);

        const updatedPlayer = createPlayer(data, userId);

        if (playerIndex !== -1) {
            this.players[playerIndex] = updatedPlayer;
        } else {
            this.players.push(updatedPlayer);
        }

        await this.save();
    }

    async load(): Promise<Player[]> {
        try {
            const rawData = await this.client.get(this.REDIS_KEY);

            if (!rawData) {
                this.players = [];
                return [];
            }

            const collection = JSON.parse(rawData) as UserCollection;

            this.players = Object.entries(collection).map(
                ([userId, playerData]) => createPlayer(playerData, userId),
            );

            return this.players;
        } catch (error) {
            console.warn(
                'Помилка завантаження з Redis, ініціалізація порожнім списком.',
                error,
            );
            this.players = [];
            return [];
        }
    }

    async save(): Promise<void> {
        try {
            const userCollection = this.players.reduce<UserCollection>(
                (collection, player) => {
                    collection[String(player.getId())] = player.getPlayerData();
                    return collection;
                },
                {},
            );

            const json = JSON.stringify(userCollection);
            await this.client.set(this.REDIS_KEY, json);

            console.log('Saved', this.players.length, 'users to Redis.');
        } catch (error) {
            console.error('Помилка збереження в Redis:', error);
        }
    }

    getPlayer(userId: string): Player | undefined {
        // Since we keep a local cache in this.players, this remains synchronous
        return this.players.find(player => player.getId() === userId);
    }

    getAllPlayers(): Player[] {
        return this.players;
    }

    async createPlayer(
        userId: string,
        username: string,
        firstName: string,
    ): Promise<Player> {
        const player = createPlayer(
            createPlayerData(firstName, username),
            userId,
        );
        this.players.push(player);
        await this.save();
        return player;
    }

    getRandomPlayer(): Player | undefined {
        if (this.players.length === 0) return undefined;
        return this.players[Math.floor(Math.random() * this.players.length)];
    }

    async disconnect(): Promise<void> {
        await this.client.quit();
    }
}

export {PlayersManager};
