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
        return this.data.score;
    }

    getDickSize(): number {
        return this.data.dickSize;
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
