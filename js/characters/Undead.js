import Character from "../Character";

export default class Undead extends Character {
  constructor(level) {
    super(level, "undead");
    this.health = 100;
    this.attack = 40;
    this.defence = 10;
  }
}
