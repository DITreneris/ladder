export const AVATAR_EMOJI_OPTIONS = ["👩‍💻", "👨‍💻", "🧑‍💻"] as const;

export type AvatarEmoji = (typeof AVATAR_EMOJI_OPTIONS)[number];

const STORAGE_KEY = "corp_ladder_avatar_emoji";

const DEFAULT_AVATAR: AvatarEmoji = "🧑‍💻";

function isAvatarEmoji(value: string): value is AvatarEmoji {
  return (AVATAR_EMOJI_OPTIONS as readonly string[]).includes(value);
}

export function getStoredAvatarEmoji(): AvatarEmoji {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isAvatarEmoji(stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_AVATAR;
}

export function setStoredAvatarEmoji(emoji: AvatarEmoji): void {
  try {
    localStorage.setItem(STORAGE_KEY, emoji);
  } catch {
    /* ignore */
  }
}

export function cycleAvatarEmoji(current: AvatarEmoji): AvatarEmoji {
  const idx = AVATAR_EMOJI_OPTIONS.indexOf(current);
  const next = AVATAR_EMOJI_OPTIONS[(idx + 1) % AVATAR_EMOJI_OPTIONS.length]!;
  setStoredAvatarEmoji(next);
  return next;
}
