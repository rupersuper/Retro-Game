import { beforeEach, describe, it, expect, test } from "vitest";
import Character from "../Character";
import Bowman from "../characters/Bowman";
import Swordsman from "../characters/Swordsman";
import Magician from "../characters/Magician";
import Vampire from "../characters/Vampire";
import Undead from "../characters/Undead";
import Daemon from "../characters/Daemon";
import LevelUpCharacter from "../LevelUpCharacter";

test.each([
  ["Bowman", Bowman, 1],
  ["Daemon", Daemon, 1],
  ["Magician", Magician, 1],
  ["Swordsman", Swordsman, 1],
  ["Undead", Undead, 1],
  ["Vampire", Vampire, 1],
])("create an instance of %s", (_, ClassName, level) => {
  expect(new ClassName(level)).toBeInstanceOf(ClassName);
});

test("preventing the creation of Character objects", () => {
  expect(() => new Character(1, "bowman")).toThrow(
    new Error("Нельзя создавать объекты через new Character()")
  );
});

describe("levelUp method", () => {
  let character;

  beforeEach(() => {
    character = new Bowman(1);
  });

  it("should raise level by 1", () => {
    LevelUpCharacter.levelUp(character);
    expect(character.level).toBe(2);
  });

  test.each([
    ["health is increased by 80", 15, 95],
    ["health cannot be more than 100", 30, 100],
  ])("%s", (_, health, expected) => {
    character.health = health;
    LevelUpCharacter.levelUp(character);
    expect(character.health).toBe(expected);
  });

  test("calculates the attack", () => {
    character.health = 30;
    LevelUpCharacter.levelUp(character);
    expect(character.attack).toBe(27);
  });

  test("calculates the defence", () => {
    character.health = 10;
    LevelUpCharacter.levelUp(character);
    expect(character.defence).toBe(25);
  });
});
