import { describe, it, expect } from "vitest";
import { calculateElo } from "../../src/lib/elo";

describe("calculateElo", () => {
  it("should increase winner rating and decrease loser rating", () => {
    const result = calculateElo(1200, 1200);
    expect(result.newWinnerRating).toBeGreaterThan(1200);
    expect(result.newLoserRating).toBeLessThan(1200);
  });

  it("should give symmetric changes for equal ratings", () => {
    const result = calculateElo(1200, 1200);
    const winnerGain = result.newWinnerRating - 1200;
    const loserLoss = 1200 - result.newLoserRating;
    expect(winnerGain).toBe(loserLoss);
  });

  it("should give smaller gain when favorite wins", () => {
    const favoriteWins = calculateElo(1400, 1200);
    const underdogWins = calculateElo(1200, 1400);

    const favoriteGain = favoriteWins.newWinnerRating - 1400;
    const underdogGain = underdogWins.newWinnerRating - 1200;

    expect(underdogGain).toBeGreaterThan(favoriteGain);
  });

  it("should return integer ratings", () => {
    const result = calculateElo(1234, 1567);
    expect(Number.isInteger(result.newWinnerRating)).toBe(true);
    expect(Number.isInteger(result.newLoserRating)).toBe(true);
  });

  it("should give K/2 = 16 points for equal ratings", () => {
    const result = calculateElo(1200, 1200);
    expect(result.newWinnerRating).toBe(1216);
    expect(result.newLoserRating).toBe(1184);
  });
});
