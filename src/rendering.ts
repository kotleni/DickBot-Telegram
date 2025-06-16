import { Player } from "./player";
import { Case } from "./managers/cases-manager";

function renderPlayerProfile(player: Player): string {
    let buffer = `Гравець ${player.getFirstName()}`;
    buffer += `\n🎯 Ранг: ${player.getPlayerGender()}`;
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
    function stripOrExpandName(name: string): string {
        const requireLength = 10;
        if (name.length > requireLength) {
            return `${name.slice(0, requireLength)}`;
        }
        return name.padEnd(requireLength, " ");
    }
    function simplifyName(name: string, fallbackName: string): string {
        const resultName = name.replace(/[^a-zA-Zа-яА-Я]/g, "");
        if (resultName.length > 0) return resultName;
        return fallbackName;
    }
    function expandValue(value: number, requireLength: number): string {
        const line = value.toString();
        return line.padStart(requireLength, " ");
    }
    const name = stripOrExpandName(
        simplifyName(player.getFirstName(), player.getUsername()),
    );
    const dickSize = expandValue(player.getDickSize(), 3);
    const score = expandValue(player.getScore(), 5);
    return `${place + 1}. ${name} ${dickSize} см (${score} XP)`;
}

function renderDuelStartResult(player1: Player, player2: Player): string {
    return `⚠️ Гравець ${player1.getFirstName()} визвав гравця ${player2.getFirstName()} на дуель!`;
}

function renderDuelEndResult(
    winner: Player,
    allPlayers: Player[],
    cost: number,
): string {
    let firstPart = `🎉 Гравець ${winner.getFirstName()} переміг, бо довше не кінчав!`;
    allPlayers.forEach((player) => {
        if (winner === player) firstPart += "\n+ ";
        else firstPart += "\n- ";
        firstPart += cost.toString() + ` см для ${player.getUsername()}`;
    });
    return firstPart;
}

export {
    renderPlayerProfile,
    renderCaseResult,
    renderPlayerLine,
    renderDuelStartResult,
    renderDuelEndResult,
};
