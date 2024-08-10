export default class CharacterActions {
  static calculateDistance(pos1, pos2) {
    const x1 = pos1 % 8;
    const y1 = Math.floor(pos1 / 8);
    const x2 = pos2 % 8;
    const y2 = Math.floor(pos2 / 8);
    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
  }

  static isValidMove(character, from, to, positionedCharacters) {

    const targetCellOccupied = positionedCharacters.some(
      (pc) => pc.position === to
    );

    if (targetCellOccupied) {
      return false;
    }

    const distance = this.calculateDistance(from, to);
    switch (character.type) {
      case "swordsman":
      case "undead":
        return distance <= 4;
      case "bowman":
      case "vampire":
        return distance <= 2;
      case "magician":
      case "daemon":
        return distance <= 1;
      default:
        return false;
    }
  }

  static isValidAttack(character, from, to, positionedCharacters) {
    const targetCellOccupied = positionedCharacters.some(
      (pc) => pc.position === to
    );

    if (!targetCellOccupied) {
      return false;
    }

    const distance = this.calculateDistance(from, to);
    switch (character.type) {
      case "swordsman":
      case "undead":
        return distance === 1;
      case "bowman":
      case "vampire":
        return distance <= 2;
      case "magician":
      case "daemon":
        return distance <= 4;
      default:
        return false;
    }
  }
}
