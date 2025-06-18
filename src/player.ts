import {Item} from './items';

interface PlayerData {
  firstName: string;
  username: string;
  dickSize: number;
  score: number;
  fertilizations: number;
  cums: number;
  items: InventoryItem[];
}

function createPlayerData(firstName: string, username: string): PlayerData {
  return {
    firstName,
    username,
    dickSize: 16,
    score: 0,
    fertilizations: 0,
    cums: 0,
    items: [],
  };
}

function createPlayer(data: PlayerData, tgId: string): Player {
  return new Player(data, tgId);
}

interface Gender {
  name: string;
  currentRule: GenderRule;
  nextRule: GenderRule;
}

interface GenderRule {
  name: string;
  minSize: number;
  maxSize: number;
}

interface InventoryItem {
  id: string;
  amount: number;
}

class GenderResolver {
  private rules: GenderRule[] = [
    // Rules should be sorted by minSize
    {name: 'Дівчина', minSize: 0, maxSize: 0},
    {name: 'Фембой', minSize: 1, maxSize: 10},
    {name: 'Хлопець', minSize: 10, maxSize: 44},
    {name: 'Мастурбатор', minSize: 44, maxSize: 70},
    {name: 'Чоловік', minSize: 70, maxSize: 100},
    {name: 'Анальний дебошир', minSize: 100, maxSize: 200},
    {name: 'Секс-монстер', minSize: 200, maxSize: 300},
    {name: 'Насильник', minSize: 300, maxSize: 400},
    {name: 'БДСМ-Катувальник', minSize: 400, maxSize: 666},
    {name: 'HOMELANDER', minSize: 666, maxSize: 1000},
    {name: 'Сукуб-осіменитель', minSize: 1000, maxSize: 3000},
    {
      name: 'Бог сексу',
      minSize: 3000,
      maxSize: 99999999,
    },
  ];

  forPlayer(player: Player): Gender {
    const dickSize = player.getDickSize();
    const rule = this.rules.find(rule => {
      return dickSize >= rule.minSize && dickSize <= rule.maxSize;
    })!;
    const index = this.rules.indexOf(rule);
    const nextIndex = index + 1;
    const nextRule = this.rules[nextIndex];
    return {name: rule.name, currentRule: rule, nextRule: nextRule};
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

  cutDick(amountValue: number) {
    this.data.dickSize -= amountValue;
  }

  getPlayerData() {
    return this.data;
  }

  getId() {
    return this.tgId;
  }

  getFertilizations() {
    if (!this.data.fertilizations) this.data.fertilizations = 0;
    return this.data.fertilizations;
  }

  incrementFertilizations(): number {
    return ++this.data.fertilizations;
  }

  getCums() {
    if (!this.data.cums) this.data.cums = 0;
    return this.data.cums;
  }

  incrementCums(): number {
    return ++this.data.cums;
  }

  getItems(): InventoryItem[] {
    if (this.data.items === undefined) this.data.items = [];
    return this.data.items;
  }

  addItem(item: Item, amount: number = 1): void {
    const existItem = this.data.items.find(i => i.id === item.id);
    if (existItem) {
      existItem.amount += amount;
      return;
    }
    this.data.items.push({id: item.id, amount: amount});
  }
}

export {Player, PlayerData, createPlayer, createPlayerData};
