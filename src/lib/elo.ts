const K_FACTOR = 32;

export function calculateElo(
  winnerRating: number,
  loserRating: number
): { newWinnerRating: number; newLoserRating: number } {
  const expectedWinner =
    1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser =
    1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  return {
    newWinnerRating: Math.round(winnerRating + K_FACTOR * (1 - expectedWinner)),
    newLoserRating: Math.round(loserRating + K_FACTOR * (0 - expectedLoser)),
  };
}
