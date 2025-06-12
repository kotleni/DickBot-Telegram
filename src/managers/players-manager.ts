import { createPlayer, createPlayerData, Player, PlayerData } from "../player";
import * as fs from "node:fs";

type UserCollection = Record<string, PlayerData>;

class PlayersManager {
    private readonly dataFilePath: string = "players-v2.json";
    private players: Player[] = [];

    load(): Player[] {
        try {
            if (!fs.existsSync(this.dataFilePath)) {
                return [];
            }
            const rawData = fs.readFileSync(this.dataFilePath, "utf8");
            const collection = JSON.parse(rawData) as UserCollection;

            const players = Object.entries(collection).map(
                ([userId, playerData]) => {
                    return createPlayer(playerData, userId);
                },
            );
            this.players = players;
            return players;
        } catch (error) {
            console.warn(
                "Помилка завантаження players.json, створюю нові дані.",
                error,
            );
            return [];
        }
    }

    save(): void {
        try {
            // Transform the array of Player instances back into an object
            const userCollection = this.players.reduce<UserCollection>(
                (collection, player) => {
                    const playerData = player.getPlayerData();
                    // We use the player's ID as the key
                    collection[String(player.getId())] = playerData;
                    return collection;
                },
                {},
            );

            const json = JSON.stringify(userCollection, null, 2);
            fs.writeFileSync(this.dataFilePath, json, "utf8");
            console.log("Saved", this.players.length, "users.");
        } catch (error) {
            console.error("Помилка збереження даних:", error);
        }
    }

    getPlayer(userId: string): Player | undefined {
        return this.players.find((player) => player.getId() === userId);
    }

    getAllPlayers(): Player[] {
        return this.players;
    }

    createPlayer(userId: string, username: string, firstName: string): Player {
        const player = createPlayer(
            createPlayerData(firstName, username),
            userId,
        );
        this.players.push(player);
        this.save();
        return player;
    }
}

export { PlayersManager };
