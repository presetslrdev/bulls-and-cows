import { describe, it, expect } from "vitest";
import { createInitialState, startNewGame, processGuess, resetGame } from "../src/game/state";

describe("Game State Management (Immutability & Rules)", () => {
  it("should initialize in settings state", () => {
    const state = createInitialState({ length: 4, base: 10 });
    expect(state.status).toBe("settings");
    expect(state.history).toEqual([]);
    expect(state.secret).toBe("");
  });

  it("should start a new game with locked settings, generated secret, and timestamp", () => {
    const fixedRandom = () => 0.0; // generates '0123'
    const now = () => 1700000000000;

    const state = startNewGame({ length: 4, base: 10 }, fixedRandom, now);

    expect(state.status).toBe("playing");
    expect(state.secret).toBe("0123");
    expect(state.startTime).toBe(1700000000000);
    expect(state.history).toHaveLength(0);
  });

  it("should constrain binary base length to at most 2", () => {
    const state = startNewGame({ length: 5, base: 2 });
    expect(state.settings.length).toBe(2);
    expect(state.secret.length).toBe(2);
  });

  it("should immutably append valid guesses to history", () => {
    const fixedRandom = () => 0.0; // secret '0123'
    const initialState = startNewGame({ length: 4, base: 10 }, fixedRandom);

    const outcome1 = processGuess(initialState, "5678");
    expect(outcome1.type).toBe("SUCCESS");
    expect(initialState.history).toHaveLength(0); // initial state remains unchanged!
    expect(outcome1.state.history).toHaveLength(1);
    expect(outcome1.state.history[0].guess).toBe("5678");
    expect(outcome1.state.history[0].bulls).toBe(0);
    expect(outcome1.state.history[0].cows).toBe(0);

    const outcome2 = processGuess(outcome1.state, "0145");
    expect(outcome2.type).toBe("SUCCESS");
    expect(outcome1.state.history).toHaveLength(1); // previous state not mutated!
    expect(outcome2.state.history).toHaveLength(2);
    expect(outcome2.state.history[1].bulls).toBe(2);
    expect(outcome2.state.history[1].cows).toBe(0);
  });

  it("should handle duplicate guesses without adding to history", () => {
    const fixedRandom = () => 0.0;
    const state = startNewGame({ length: 4, base: 10 }, fixedRandom);
    const outcome1 = processGuess(state, "1234");
    expect(outcome1.type).toBe("SUCCESS");

    const duplicateOutcome = processGuess(outcome1.state, "1234");
    expect(duplicateOutcome.type).toBe("DUPLICATE_GUESS");
    expect(duplicateOutcome.state.history).toHaveLength(1);
  });

  it("should detect win condition when bulls equal secret length and set status to won", () => {
    const fixedRandom = () => 0.0; // secret '0123'
    const startTime = 1000;
    const winTime = 5000;
    const state = startNewGame({ length: 4, base: 10 }, fixedRandom, () => startTime);

    const winOutcome = processGuess(state, "0123", () => winTime);
    expect(winOutcome.type).toBe("SUCCESS");
    expect(winOutcome.state.status).toBe("won");
    expect(winOutcome.state.endTime).toBe(winTime);
    expect(winOutcome.state.history).toHaveLength(1);
    expect(winOutcome.state.history[0].bulls).toBe(4);
  });

  it("should reset game back to settings without page reload", () => {
    const fixedRandom = () => 0.0;
    const playing = startNewGame({ length: 4, base: 10 }, fixedRandom);
    const reset = resetGame(playing.settings);

    expect(reset.status).toBe("settings");
    expect(reset.history).toEqual([]);
    expect(reset.secret).toBe("");
  });
});
