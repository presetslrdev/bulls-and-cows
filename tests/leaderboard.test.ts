import { describe, it, expect, beforeEach } from "vitest";
import {
  loadLeaderboard,
  saveScoreRecord,
  sortLeaderboard,
  clearLeaderboard,
} from "../src/storage/leaderboard";
import { ScoreRecord } from "../src/game/types";

class MemoryStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe("Leaderboard persistence & sorting", () => {
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = new MemoryStorage();
  });

  it("should return empty list when no scores are saved", () => {
    expect(loadLeaderboard(mockStorage)).toEqual([]);
  });

  it("should sort records primarily by attempts ascending, secondarily by time ascending", () => {
    const records: ScoreRecord[] = [
      {
        id: "1",
        playerName: "Alice",
        base: 10,
        length: 4,
        attempts: 7,
        elapsedSeconds: 45,
        date: "2026-11-01T10:00:00Z",
      },
      {
        id: "2",
        playerName: "Bob",
        base: 10,
        length: 4,
        attempts: 4,
        elapsedSeconds: 60,
        date: "2026-11-01T10:05:00Z",
      },
      {
        id: "3",
        playerName: "Charlie",
        base: 10,
        length: 4,
        attempts: 4,
        elapsedSeconds: 30,
        date: "2026-11-01T10:10:00Z",
      },
    ];

    const sorted = sortLeaderboard(records);
    expect(sorted.map((r) => r.playerName)).toEqual(["Charlie", "Bob", "Alice"]);
  });

  it("should save a record, persist it to storage, and reload it", () => {
    saveScoreRecord(
      {
        playerName: "Denis",
        base: 16,
        length: 4,
        attempts: 5,
        elapsedSeconds: 72,
      },
      mockStorage,
    );

    const loaded = loadLeaderboard(mockStorage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].playerName).toBe("Denis");
    expect(loaded[0].base).toBe(16);
    expect(loaded[0].attempts).toBe(5);
  });

  it("should handle invalid JSON in storage gracefully", () => {
    mockStorage.setItem("bulls_and_cows_leaderboard_v1", "{corrupted json");
    expect(loadLeaderboard(mockStorage)).toEqual([]);
  });

  it("should clear the leaderboard correctly", () => {
    saveScoreRecord(
      {
        playerName: "Player",
        base: 10,
        length: 4,
        attempts: 3,
        elapsedSeconds: 20,
      },
      mockStorage,
    );
    expect(loadLeaderboard(mockStorage)).toHaveLength(1);

    clearLeaderboard(mockStorage);
    expect(loadLeaderboard(mockStorage)).toHaveLength(0);
  });
});
