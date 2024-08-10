export default class LevelUpCharacter {
  static levelUp(character) {
    character.level += 1;
    character.attack = Math.floor(
      Math.max(
        character.attack,
        (character.attack * (80 + character.health)) / 100
      )
    );
    character.defence = Math.floor(
      Math.max(
        character.defence,
        (character.defence * (80 + character.health)) / 100
      )
    );
    character.health = Math.min(character.health + 80, 100);
  }
}
