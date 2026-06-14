/** Pure helpers for revive + pending submit coordination (testable without DOM). */

/** Whether pending submit state should be cleared after revive ad completes. */
export function shouldClearPendingOnRevive(pendingSubmitDeferred: boolean): boolean {
  return !pendingSubmitDeferred;
}

/** After flush attempt on revive, whether revive continuation is safe to start. */
export function resolveReviveSubmitState(args: {
  flushOk: boolean | null;
  stillDeferred: boolean;
}): { canRestore: boolean; keepPending: boolean } {
  return {
    canRestore: true,
    keepPending: args.stillDeferred,
  };
}
