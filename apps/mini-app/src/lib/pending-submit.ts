/** When to flush a deferred revive-eligible score on app background/close. */
export function shouldFlushPendingSubmitOnLeave(
  pendingSubmitDeferred: boolean,
  hasPendingResult: boolean,
  awaitingReviveRunSubmit: boolean
): boolean {
  return pendingSubmitDeferred && hasPendingResult && !awaitingReviveRunSubmit;
}
