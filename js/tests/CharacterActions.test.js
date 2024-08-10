import { describe, it, expect } from "vitest";
import CharacterActions from "../CharacterActions";

describe("CharacterActions", () => {
  describe("calculateDistance", () => {
    it("should calculate the correct distance between two positions", () => {
      expect(CharacterActions.calculateDistance(0, 9)).toBe(1);
      expect(CharacterActions.calculateDistance(0, 16)).toBe(2);
      expect(CharacterActions.calculateDistance(0, 63)).toBe(7);
    });
  });

  describe("isValidMove", () => {
    it("should return true for valid moves", () => {
      const character = { type: "swordsman" };
      const positionedCharacters = [];
      expect(
        CharacterActions.isValidMove(character, 0, 4, positionedCharacters)
      ).toBe(true);
      expect(
        CharacterActions.isValidMove(character, 0, 1, positionedCharacters)
      ).toBe(true);
    });

    it("should return false for invalid moves", () => {
      const character = { type: "swordsman" };
      const positionedCharacters = [{ position: 4 }];
      expect(
        CharacterActions.isValidMove(character, 0, 4, positionedCharacters)
      ).toBe(false);
      expect(
        CharacterActions.isValidMove(character, 0, 7, positionedCharacters)
      ).toBe(false);
    });

    it("should handle different character types", () => {
      let character = { type: "bowman" };
      let positionedCharacters = [];
      expect(
        CharacterActions.isValidMove(character, 0, 2, positionedCharacters)
      ).toBe(true);
      expect(
        CharacterActions.isValidMove(character, 0, 3, positionedCharacters)
      ).toBe(false);

      character = { type: "magician" };
      expect(
        CharacterActions.isValidMove(character, 0, 1, positionedCharacters)
      ).toBe(true);
      expect(
        CharacterActions.isValidMove(character, 0, 2, positionedCharacters)
      ).toBe(false);
    });
  });

  describe("isValidAttack", () => {
    it("should return true for valid attacks", () => {
      const character = { type: "swordsman" };
      const positionedCharacters = [{ position: 1 }];
      expect(
        CharacterActions.isValidAttack(character, 0, 1, positionedCharacters)
      ).toBe(true);

      const bowman = { type: "bowman" };
      expect(
        CharacterActions.isValidAttack(bowman, 3, 1, positionedCharacters)
      ).toBe(true);
    });

    it("should return false for invalid attacks", () => {
      const character = { type: "swordsman" };
      const positionedCharacters = [{ position: 4 }];
      expect(
        CharacterActions.isValidAttack(character, 0, 4, positionedCharacters)
      ).toBe(false);

      const magician = { type: "magician" };
      expect(
        CharacterActions.isValidAttack(magician, 0, 5, positionedCharacters)
      ).toBe(false);
    });

    it("should return false if target cell is not occupied", () => {
      const character = { type: "swordsman" };
      const positionedCharacters = [];
      expect(
        CharacterActions.isValidAttack(character, 0, 1, positionedCharacters)
      ).toBe(false);
    });
  });
});
