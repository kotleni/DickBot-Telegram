interface PlayerData {
    firstName: string;
    username: string;
    dickSize: number;
    score: number;
}

function createPlayerData(firstName: string, username: string): PlayerData {
    return { firstName, username, dickSize: 16, score: 0 };
}

function createPlayer(data: PlayerData, tgId: string): Player {
    return new Player(data, tgId);
}

interface Gender {
    name: string;
}

interface GenderRule {
    gender: Gender;
    minSize: number;
    maxSize: number;
}

class GenderResolver {
    private rules: GenderRule[] = [
        // Rules should be sorted by minSize
        { gender: { name: "Дівчина" }, minSize: 0, maxSize: 0 },
        { gender: { name: "Фембой" }, minSize: 1, maxSize: 10 },
        { gender: { name: "Хлопець" }, minSize: 10, maxSize: 44 },
        { gender: { name: "Мастурбатор" }, minSize: 44, maxSize: 70 },
        { gender: { name: "Чоловік" }, minSize: 70, maxSize: 100 },
        { gender: { name: "Анальний дебошир" }, minSize: 100, maxSize: 200 },
        { gender: { name: "Секс-монстер" }, minSize: 200, maxSize: 300 },
        { gender: { name: "Насильник" }, minSize: 300, maxSize: 400 },
        { gender: { name: "БДСМ-Катувальник" }, minSize: 400, maxSize: 666 },
        { gender: { name: "HOMELANDER" }, minSize: 666, maxSize: 1000 },
        { gender: { name: "Сукуб-осіменитель" }, minSize: 1000, maxSize: 3000 },
        {
            gender: { name: "Бог сексу" },
            minSize: 3000,
            maxSize: 9999999999999999,
        },
    ];

    forPlayer(player: Player): Gender {
        const dickSize = player.getDickSize();
        return this.rules.find((rule) => {
            return dickSize >= rule.minSize && dickSize <= rule.maxSize;
        })?.gender!!;
    }
}

class Player {
    private data: PlayerData;
    private tgId: string;

    constructor(data: PlayerData, tgId: string) {
        this.data = data;
        this.tgId = tgId;
    }

    isHaveDick(): boolean {
        return this.data.dickSize > 0;
    }

    getScore(): number {
        return Math.round(this.data.score);
    }

    getDickSize(): number {
        if (this.data.dickSize < 0) this.data.dickSize = 0;
        return Math.round(this.data.dickSize);
    }

    getPlayerGender(): Gender {
        const resolver = new GenderResolver();
        return resolver.forPlayer(this);
    }

    getUsername(): string {
        return this.data.username;
    }

    getFirstName(): string {
        return this.data.firstName;
    }

    addScore(score: number): number {
        this.data.score += score;
        return this.data.score;
    }

    addDickSize(size: number): number {
        this.data.dickSize += size;
        return this.data.dickSize;
    }

    getPlayerData() {
        return this.data;
    }

    getId() {
        return this.tgId;
    }
}

export { Player, PlayerData, createPlayer, createPlayerData };
