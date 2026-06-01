/** Career high after submit — never bump on failed or skipped submit. */
export function nextHighScoreAfterSubmit(
  currentHigh: number,
  runYears: number,
  submitOk: boolean,
  profileBest?: number
): number {
  if (!submitOk) return currentHigh;
  if (profileBest !== undefined) return profileBest;
  return runYears > currentHigh ? runYears : currentHigh;
}
