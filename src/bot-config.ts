import * as fs from 'node:fs';

interface Config {
  groupsIds: number[];
  adminsUsersIds: number[];
  blockedUsersIds: number[];
  disabledCommands: string[];
}

function createDefaultConfig(): Config {
  return {
    groupsIds: [],
    adminsUsersIds: [],
    blockedUsersIds: [],
    disabledCommands: [],
  };
}

export class BotConfig {
  private config: Config = createDefaultConfig();
  private readonly configPath = './config.json';

  async load() {
    const isExist = fs.existsSync(this.configPath);
    if (!isExist) return; // Just ignore

    const json = await fs.promises.readFile(this.configPath, 'utf8');
    this.config = JSON.parse(json);
  }

  async save() {
    const json = JSON.stringify(this.config, null, 2);
    await fs.promises.writeFile(this.configPath, json, 'utf8');
  }

  async commit(callback: (this: BotConfig) => Promise<void>) {
    await callback.call(this);
    await this.save();
  }

  get groupsIds(): number[] {
    return this.config.groupsIds;
  }

  get adminsUsersIds(): number[] {
    return this.config.adminsUsersIds;
  }

  get blockedUsersIds(): number[] {
    return this.config.blockedUsersIds;
  }

  get disabledCommands(): string[] {
    return this.config.disabledCommands;
  }

  isBlockedCommand(command: string) {
    return this.config.disabledCommands.includes(command);
  }

  addGroup(groupId: number) {
    this.config.groupsIds.push(groupId);
  }

  blockUser(userId: number) {
    this.config.blockedUsersIds.push(userId);
  }

  pardonUser(userId: number) {
    this.config.blockedUsersIds = this.config.blockedUsersIds.filter(
      id => id !== userId,
    );
  }

  promoteAdmin(userId: number) {
    this.config.adminsUsersIds.push(userId);
  }

  demoteAdmin(userId: number) {
    this.config.adminsUsersIds = this.config.adminsUsersIds.filter(
      id => id !== userId,
    );
  }

  disableCommand(command: string) {
    this.config.disabledCommands.push(command);
  }

  enableCommand(command: string) {
    this.config.disabledCommands = this.config.disabledCommands.filter(
      id => id !== command,
    );
  }

  isAdmin(userId: string | undefined) {
    if (!userId) return false;
    return this.config.adminsUsersIds.includes(Number(userId));
  }

  isBanned(userId: string | undefined) {
    if (!userId) return false;
    return this.config.blockedUsersIds.includes(Number(userId));
  }

  isGroupAllowed(id: number | undefined) {
    if (!id) return false;
    if (this.config.groupsIds.length === 0) return true; // Allow any group by default
    return this.config.groupsIds.includes(Number(id));
  }
}
