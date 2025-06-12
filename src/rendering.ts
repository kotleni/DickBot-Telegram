import { Player } from "./player";
import { Case } from "./managers/cases-manager";

function renderPlayerProfile(player: Player): string {
    let buffer = `Гравець ${player.getFirstName()}`;
    buffer += `\n⭐️ XP: ${player.getScore()}`;
    if (player.isHaveDick()) buffer += `\n🍆 Пеніс: ${player.getDickSize()} см`;
    else buffer += `\n🍆 Немає пенісу. (Відновити: /dick)`;
    buffer += `\n\nОстанній відома юзерка: @${player.getUsername()}`;
    return buffer;
}

function renderCaseResult(situationCase: Case, player: Player): string {
    const situationValue = situationCase.value;
    let growthMessage = situationCase.message;
    if (situationValue > 0) growthMessage += `\n+ ${situationValue} см`;
    if (situationValue < 0)
        growthMessage += `\n- ${Math.abs(situationValue)} см`;

    return `${growthMessage}\n\n🍆Тепер у вас пеніс <b>${player.getDickSize()}</b> см.`;
}

function renderPlayerLine(player: Player, place: number): string {
    return `${place + 1}. ${player.getFirstName()} ${player.getDickSize()} см`;
}

export { renderPlayerProfile, renderCaseResult, renderPlayerLine };
