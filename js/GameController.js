import GameState from "./GameState";
import { generateTeam } from "./generators";
import cursors from "./cursors";
import themes from "./themes";
import Team from "./Team";

import PositionedCharacter from "./PositionedCharacter";
import LevelUpCharacter from "./LevelUpCharacter";
import CharacterActions from "./CharacterActions";

import Bowman from "./characters/Bowman";
import Swordsman from "./characters/Swordsman";
import Magician from "./characters/Magician";
import Vampire from "./characters/Vampire";
import Undead from "./characters/Undead";
import Daemon from "./characters/Daemon";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.positionedCharacters = [];
    this.state = new GameState();
    this.currentTurn = "player";
    this.currentLevel = 0;
    this.gamePlay.addNewGameListener(this.startNewGame.bind(this));
    this.gamePlay.addLoadGameListener(this.restoreGame.bind(this));
  }

  init() {
    this.startNewGame();

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
  }

  startGame() {
    if (this.currentLevel === 4) {
      this.gamePlay.showMessage("Вы выиграли!");
      this.currentLevel = 3;
      this.blockGame();
    }

    this.gamePlay.drawUi(themes[this.currentLevel]);

    const playerTypes = [Bowman, Swordsman, Magician];
    const enemyTypes = [Vampire, Undead, Daemon];

    const enemyTeam = generateTeam(enemyTypes, 4, 1);
    let playerTeam;

    if (this.state.playerTeam.length === 0) {
      playerTeam = generateTeam(playerTypes, 4, 4);
    } else {
      playerTeam = this.state.playerTeam;
    }

    const positionedCharacters = [];
    const playerPositions = this.generatePositions([0, 1]);
    const enemyPositions = this.generatePositions([6, 7]);

    playerTeam.characters.forEach((character) => {
      const position = playerPositions.pop();
      positionedCharacters.push(new PositionedCharacter(character, position));
    });

    enemyTeam.characters.forEach((character) => {
      const position = enemyPositions.pop();
      positionedCharacters.push(new PositionedCharacter(character, position));
    });

    this.positionedCharacters = positionedCharacters;
    this.gamePlay.redrawPositions(positionedCharacters);
  }

  generatePositions(columns) {
    const positions = [];
    for (let i = 0; i < 8; i++) {
      columns.forEach((column) => {
        positions.push(column + i * 8);
      });
    }
    return this.shuffleArray(positions);
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  onCellClick(index) {
    if (this.state.currentTurn !== "player") {
      this.gamePlay.showError("ход противника");
      return;
    }
    const character = this.positionedCharacters.find(
      (pc) => pc.position === index
    );

    if (character && this.isPlayerCharacter(character.character)) {
      if (this.state.selectedCharacter) {
        this.gamePlay.deselectCell(this.state.selectedCharacter.position);
      }
      this.state.selectedCharacter = character;
      this.gamePlay.selectCell(index);
    } else if (this.state.selectedCharacter) {
      const { character: selectedCharacter, position } =
        this.state.selectedCharacter;

      if (
        CharacterActions.isValidMove(
          selectedCharacter,
          position,
          index,
          this.positionedCharacters
        )
      ) {
        console.log(
          `Движение ${selectedCharacter.type} из ${position} в ${index}`
        );
        this.state.selectedCharacter.position = index;
        this.gamePlay.deselectCell(position);
        this.gamePlay.redrawPositions(this.positionedCharacters);
        this.state.selectedCharacter = null;
        this.endTurn();
      } else if (
        CharacterActions.isValidAttack(
          selectedCharacter,
          position,
          index,
          this.positionedCharacters
        )
      ) {
        console.log(`Атака из ${position} в ${index}`);
        this.attackCharacter(selectedCharacter, character, index);
      } else {
        this.gamePlay.showError("Невернй ход");
      }
    } else {
      this.gamePlay.showError("Выберите персонажа из своей команды");
    }
  }

  onCellEnter(index) {
    const positionedCharacter = this.positionedCharacters.find(
      (pc) => pc.position === index
    );

    if (positionedCharacter) {
      const { level, attack, defence, health } = positionedCharacter.character;
      const tooltipMessage = `🎖${level} ⚔${attack} 🛡${defence} ❤${health}`;
      this.gamePlay.showCellTooltip(tooltipMessage, index);
    }

    if (this.state.selectedCharacter) {
      const { character, position } = this.state.selectedCharacter;
      if (positionedCharacter) {
        if (this.isPlayerCharacter(positionedCharacter.character)) {
          this.gamePlay.setCursor(cursors.pointer);
        } else if (
          CharacterActions.isValidAttack(
            character,
            position,
            index,
            this.positionedCharacters
          )
        ) {
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, "red");
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      } else if (
        CharacterActions.isValidMove(
          character,
          position,
          index,
          this.positionedCharacters
        )
      ) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, "green");
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.deselectCell(index);
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
    if (this.state.selectedCharacter) {
      const { position } = this.state.selectedCharacter;
      if (index !== position) {
        this.gamePlay.deselectCell(index);
      }
    }
  }

  attackCharacter(attacker, defender, targetIndex) {
    const damage = Math.max(
      attacker.attack - defender.character.defence,
      attacker.attack * 0.1
    );
    console.log(
      `Атакующий: ${attacker.type}, Защищающися: ${defender.character.type}, Урон: ${damage}`
    );
    defender.character.health -= damage;

    this.gamePlay.showDamage(targetIndex, damage).then(() => {
      if (defender.character.health <= 0) {
        console.log(`${defender.character.type} умер`);
        this.state.selectedCharacter = null;
        this.positionedCharacters = this.positionedCharacters.filter(
          (pc) => pc !== defender
        );
      }
      this.gamePlay.redrawPositions(this.positionedCharacters);
      this.checkEndOfRound();
    });
  }

  checkEndOfRound() {
    const enemyCharacters = this.positionedCharacters.filter(
      (pc) => !this.isPlayerCharacter(pc.character)
    );
    const playerCharacters = this.positionedCharacters.filter((pc) =>
      this.isPlayerCharacter(pc.character)
    );
    if (enemyCharacters.length === 0) {
      this.currentLevel = this.currentLevel + 1;
      playerCharacters.forEach((pc) => LevelUpCharacter.levelUp(pc.character));
      const oldplayerTeam = new Team();
      playerCharacters.forEach((pc) => oldplayerTeam.add(pc.character));
      this.state.playerTeam = oldplayerTeam;
      this.startGame();
    } else if (playerCharacters.length === 0) {
      this.blockGame();
    } else {
      this.endTurn();
    }
  }

  isPlayerCharacter(character) {
    return (
      character instanceof Bowman ||
      character instanceof Swordsman ||
      character instanceof Magician
    );
  }

  endTurn() {
    this.state.currentTurn =
      this.state.currentTurn === "player" ? "computer" : "player";
    if (this.state.currentTurn === "computer") {
      console.log("ход компьютра");
      this.computerMove();
    }
  }

  computerMove() {
    const enemyCharacters = this.positionedCharacters.filter(
      (pc) => !this.isPlayerCharacter(pc.character)
    );
    const playerCharacters = this.positionedCharacters.filter((pc) =>
      this.isPlayerCharacter(pc.character)
    );

    for (const enemy of enemyCharacters) {
      for (const player of playerCharacters) {
        if (
          CharacterActions.isValidAttack(
            enemy.character,
            enemy.position,
            player.position,
            this.positionedCharacters
          )
        ) {
          this.attackCharacter(enemy.character, player, player.position);
          return;
        }
      }
    }

    for (const enemy of enemyCharacters) {
      const closestPlayerCharacter = playerCharacters.reduce(
        (closest, current) => {
          const closestDistance = CharacterActions.calculateDistance(
            enemy.position,
            closest.position
          );
          const currentDistance = CharacterActions.calculateDistance(
            enemy.position,
            current.position
          );
          return currentDistance < closestDistance ? current : closest;
        }
      );

      const movePositions = this.generateValidMovePositions(
        enemy,
        closestPlayerCharacter.position
      );
      if (movePositions.length > 0) {
        enemy.position = movePositions[0];
        this.gamePlay.redrawPositions(this.positionedCharacters);
        this.endTurn();
        return;
      }
    }
    this.endTurn();
  }

  generateValidMovePositions(character, targetPosition) {
    const positions = [];
    for (let i = 0; i < 64; i++) {
      if (
        CharacterActions.isValidMove(
          character.character,
          character.position,
          i,
          this.positionedCharacters
        ) &&
        !this.positionedCharacters.find((pc) => pc.position === i)
      ) {
        positions.push(i);
      }
    }
    return positions.sort(
      (a, b) =>
        CharacterActions.calculateDistance(a, targetPosition) -
        CharacterActions.calculateDistance(b, targetPosition)
    );
  }

  startNewGame() {
    console.log("новая игра");
    this.state = new GameState();
    this.state.currentTurn = "player";
    this.currentLevel = 0;
    this.positionedCharacters = [];
    this.unblockGame();
    this.startGame();
  }

  restoreGame() {
    console.log("игра загружена");
    try {
      const loadedState = this.stateService.load();
      this.state = loadedState;
      this.currentLevel = this.state.currentLevel;
      this.currentTurn = "player";
      this.positionedCharacters = this.state.positionedCharacters.map(
        (data) => {
          let character;
          switch (data.character.type) {
            case "bowman":
              character = new Bowman(
                data.character.level,
                data.character.attack,
                data.character.defence,
                data.character.health
              );
              break;
            case "swordsman":
              character = new Swordsman(
                data.character.level,
                data.character.attack,
                data.character.defence,
                data.character.health
              );
              break;
            case "magician":
              character = new Magician(
                data.character.level,
                data.character.attack,
                data.character.defence,
                data.character.health
              );
              break;
            case "vampire":
              character = new Vampire(
                data.character.level,
                data.character.attack,
                data.character.defence,
                data.character.health
              );
              break;
            case "undead":
              character = new Undead(
                data.character.level,
                data.character.attack,
                data.character.defence,
                data.character.health
              );
              break;
            case "daemon":
              character = new Daemon(
                data.character.level,
                data.character.attack,
                data.character.defence,
                data.character.health
              );
              break;
            default:
              throw new Error("Unknown character type");
          }
          return { character, position: data.position };
        }
      );

      if (this.state.selectedCharacterIndex !== null) {
        this.state.selectedCharacter =
          this.positionedCharacters[this.state.selectedCharacterIndex];
      } else {
        this.state.selectedCharacter = null;
      }

      this.gamePlay.drawUi(themes[this.state.currentLevel]);
      this.gamePlay.redrawPositions(this.state.positionedCharacters);
    } catch (error) {
      this.gamePlay.showError("Не удалось загрузить состояние игры");
    }
  }

  saveGame() {
    console.log("игра сохранена");
    this.state.positionedCharacters = this.positionedCharacters.map(
      ({ character, position }) => ({
        character: {
          type: character.type,
          level: character.level,
          attack: character.attack,
          defence: character.defence,
          health: character.health,
        },
        position,
      })
    );
    this.state.currentLevel = this.currentLevel;
    this.state.currentTurn = this.currentTurn;

    if (this.state.selectedCharacter) {
      this.state.selectedCharacterIndex = this.positionedCharacters.indexOf(
        this.state.selectedCharacter
      );
    } else {
      this.state.selectedCharacterIndex = null;
    }

    this.stateService.save(this.state);
  }

  blockGame() {
    document.getElementById("game-container").style.pointerEvents = "none";
  }

  unblockGame() {
    document.getElementById("game-container").style.pointerEvents = "auto";
  }
}
