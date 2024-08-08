export default class GameState {
  constructor() {
    this.currentLevel = 0;
    this.currentTurn = "player"; // может быть "player" или "computer"
    this.positionedCharacters = [];
    this.playerTeam = [];
    this.selectedCharacter = null;
    // this.level = 1;
    // this.charactersCount = 2;
    // this.positions = [];
    // this.currentMove = "player";
    // this.selectedCell = null;
    // this.selectedCellIndex = null;
    // this.selectedCharacter = null;
    // this.selectedCellCoordinates = null;
    // this.isAvailableToMove = false;
    // this.isAvailableToAttack = false;
    // this.playerTypes = ["bowman", "swordsman", "magician"];
    // this.enemyTypes = ["vampire", "undead", "daemon"];
    // this.playerTeam = [];
    // this.enemyTeam = [];
  }
  static from(object) {
    const gameState = new GameState();
    Object.assign(gameState, object);
    return gameState;
  }
}
