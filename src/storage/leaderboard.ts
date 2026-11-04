import { ScoreRecord } from "../game/types";

const STORAGE_KEY = "bulls_and_cows_leaderboard_v1";

/**
 * Pure sorting function for leaderboard records.
 * Primary criterion: attempts (ascending)
 * Secondary criterion: elapsedSeconds (ascending)
 * Tertiary criterion: date (most recent first)
 */
export const sortLeaderboard = (records: readonly ScoreRecord[]): readonly ScoreRecord[] => {
  return [...records].sort((a, b) => {
    if (a.attempts !== b.attempts) {
      return a.attempts - b.attempts;
    }
    if (a.elapsedSeconds !== b.elapsedSeconds) {
      return a.elapsedSeconds - b.elapsedSeconds;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

/**
 * Loads leaderboard records from localStorage safely.
 */
export const loadLeaderboard = (storage: Storage = window.localStorage): readonly ScoreRecord[] => {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return sortLeaderboard(parsed);
  } catch {
    return [];
  }
};

/**
 * Adds a new score record and persists the updated sorted list.
 */
export const saveScoreRecord = (
  record: Omit<ScoreRecord, "id" | "date">,
  storage: Storage = window.localStorage,
): readonly ScoreRecord[] => {
  const current = loadLeaderboard(storage);
  const newRecord: ScoreRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    date: new Date().toISOString(),
  };

  const updated = sortLeaderboard([...current, newRecord]);

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to persist leaderboard record", error);
  }

  return updated;
};

/**
 * Clears the leaderboard from storage.
 */
export const clearLeaderboard = (storage: Storage = window.localStorage): void => {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear leaderboard", error);
  }
};
