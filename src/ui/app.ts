import { GameState, GameSettings, RadixBase, ScoreRecord } from "../game/types";
import {
  createInitialState,
  startNewGame,
  processGuess,
  resetGame,
  DEFAULT_SETTINGS,
  getBaseName,
} from "../game/state";
import { createDigitValidator } from "../game/validator";
import { countPossibleSecrets } from "../game/permutations";
import { loadLeaderboard, saveScoreRecord, clearLeaderboard } from "../storage/leaderboard";
import { el, clearElement } from "./dom";

const BASES: readonly { name: string; base: RadixBase }[] = [
  { name: "Binary (2)", base: 2 },
  { name: "Octal (8)", base: 8 },
  { name: "Decimal (10)", base: 10 },
  { name: "Hexadecimal (16)", base: 16 },
];

const LENGTHS: readonly number[] = [2, 3, 4, 5, 6];

const formatTime = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const renderApp = (root: HTMLElement): void => {
  let gameState: GameState = createInitialState(DEFAULT_SETTINGS);
  let leaderboard: readonly ScoreRecord[] = loadLeaderboard();
  let timerInterval: number | null = null;
  let elapsedSeconds = 0;
  let feedbackMessage = "";
  let feedbackType: "info" | "warning" | "error" = "info";

  const stopTimer = (): void => {
    if (timerInterval !== null) {
      window.clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const startTimer = (): void => {
    stopTimer();
    elapsedSeconds = 0;
    timerInterval = window.setInterval(() => {
      elapsedSeconds += 1;
      const timerDisplay = document.getElementById("game-timer");
      if (timerDisplay) {
        timerDisplay.textContent = formatTime(elapsedSeconds);
      }
    }, 1000);
  };

  const updateFeedback = (msg: string, type: "info" | "warning" | "error" = "info"): void => {
    feedbackMessage = msg;
    feedbackType = type;
    const feedbackEl = document.getElementById("guess-feedback");
    if (feedbackEl) {
      feedbackEl.className = `guess-feedback ${type}`;
      feedbackEl.textContent = msg;
    }
  };

  const handleStartGame = (): void => {
    gameState = startNewGame(gameState.settings);
    feedbackMessage = "";
    feedbackType = "info";
    startTimer();
    render();
  };

  const handleResetGame = (): void => {
    stopTimer();
    gameState = resetGame(gameState.settings);
    feedbackMessage = "";
    feedbackType = "info";
    render();
  };

  const handleSettingsChange = (newSettings: Partial<GameSettings>): void => {
    let nextSettings: GameSettings = {
      ...gameState.settings,
      ...newSettings,
    };

    // Rule: in binary base (2), available length can only be 2
    if (nextSettings.base === 2) {
      nextSettings = {
        ...nextSettings,
        length: 2,
      };
    }

    gameState = {
      ...gameState,
      settings: nextSettings,
    };
    render();
  };

  const handleGuessSubmit = (guessValue: string): void => {
    const outcome = processGuess(gameState, guessValue);

    if (outcome.type === "INVALID_GUESS") {
      updateFeedback(outcome.reason, "error");
      return;
    }

    if (outcome.type === "DUPLICATE_GUESS") {
      updateFeedback(`You have already attempted "${guessValue.toUpperCase()}"!`, "warning");
      return;
    }

    // Success
    gameState = outcome.state;

    if (gameState.status === "won") {
      stopTimer();
    } else {
      updateFeedback(
        `Last guess "${guessValue.toUpperCase()}": ${outcome.evaluation.bulls} 🎯 Bulls, ${outcome.evaluation.cows} 🐮 Cows`,
        "info",
      );
    }

    render();
  };

  const handleSaveScore = (playerName: string): void => {
    const name = playerName.trim() || "Anonymous";
    leaderboard = saveScoreRecord({
      playerName: name,
      base: gameState.settings.base,
      length: gameState.settings.length,
      attempts: gameState.history.length,
      elapsedSeconds,
    });
    handleResetGame();
  };

  const handleClearLeaderboard = (): void => {
    if (window.confirm("Are you sure you want to clear the leaderboard?")) {
      clearLeaderboard();
      leaderboard = [];
      render();
    }
  };

  const renderSettingsCard = (): HTMLElement => {
    const isPlaying = gameState.status !== "settings";
    const currentBase = gameState.settings.base;
    const currentLength = gameState.settings.length;
    const possibleSecrets = countPossibleSecrets(currentLength, currentBase);

    // Base options
    const baseButtons = BASES.map(({ name, base }) =>
      el(
        "button",
        {
          className: `option-btn ${currentBase === base ? "active" : ""}`,
          attrs: {
            type: "button",
            disabled: isPlaying,
          },
          on: {
            click: () => handleSettingsChange({ base }),
          },
        },
        name,
      ),
    );

    // Length options: if base is 2, lengths > 2 must be disabled
    const lengthButtons = LENGTHS.map((len) => {
      const isDisabled = isPlaying || (currentBase === 2 && len > 2);
      return el(
        "button",
        {
          className: `option-btn ${currentLength === len ? "active" : ""}`,
          attrs: {
            type: "button",
            disabled: isDisabled,
          },
          on: {
            click: () => handleSettingsChange({ length: len }),
          },
        },
        String(len),
      );
    });

    const card = el(
      "section",
      { className: "card settings-card" },
      el("h2", { className: "card-title" }, "⚙️ Game Configuration"),
      el(
        "div",
        { className: "settings-group" },
        el("span", { className: "settings-label" }, "1. Number System (Base)"),
        el("div", { className: "button-group" }, ...baseButtons),
      ),
      el(
        "div",
        { className: "settings-group" },
        el("span", { className: "settings-label" }, "2. Secret Code Length"),
        el("div", { className: "button-group" }, ...lengthButtons),
      ),
      el(
        "div",
        { className: "combinations-hint" },
        `💡 Possible permutations with unique digits: `,
        el("strong", {}, possibleSecrets.toLocaleString()),
      ),
      !isPlaying
        ? el(
            "button",
            {
              className: "btn-primary",
              attrs: { type: "button", id: "start-game-btn" },
              on: { click: handleStartGame },
            },
            "Start Game 🚀",
          )
        : el("div", { className: "status-badge" }, "🔒 Settings are locked while round is active."),
    );

    return card;
  };

  const renderPlayingCard = (): HTMLElement => {
    const isDigitValid = createDigitValidator(gameState.settings.base);
    const inputLength = gameState.settings.length;

    const inputField = el("input", {
      className: "guess-input",
      id: "guess-input",
      attrs: {
        type: "text",
        maxLength: inputLength,
        autocomplete: "off",
        spellcheck: false,
        placeholder: "•".repeat(inputLength),
        autofocus: true,
      },
    }) as HTMLInputElement;

    // Real-time character filtering using createDigitValidator
    inputField.addEventListener("keydown", (event: KeyboardEvent) => {
      // Allow control keys (backspace, delete, arrows, enter, tab, ctrl/cmd shortcuts)
      if (
        event.key === "Backspace" ||
        event.key === "Delete" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "Tab" ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        handleGuessSubmit(inputField.value);
        return;
      }

      // Check character using curried createDigitValidator
      if (event.key.length === 1 && !isDigitValid(event.key)) {
        event.preventDefault();
        updateFeedback(
          `Character "${event.key}" is invalid for ${getBaseName(gameState.settings.base)}!`,
          "error",
        );
      }
    });

    // Handle paste or mobile inputs
    inputField.addEventListener("input", () => {
      const filtered = inputField.value
        .split("")
        .filter((char) => isDigitValid(char))
        .join("")
        .slice(0, inputLength);

      if (filtered !== inputField.value) {
        inputField.value = filtered;
      }
    });

    const submitBtn = el(
      "button",
      {
        className: "btn-primary",
        attrs: { type: "button", id: "submit-guess-btn" },
        style: { width: "auto", minWidth: "140px" },
        on: {
          click: () => handleGuessSubmit(inputField.value),
        },
      },
      "Check 🎯",
    );

    const statusBar = el(
      "div",
      { className: "game-status-bar" },
      el(
        "div",
        { className: "status-badge" },
        "Mode: ",
        el(
          "strong",
          {},
          `${getBaseName(gameState.settings.base)} | Length ${gameState.settings.length}`,
        ),
      ),
      el(
        "div",
        { className: "status-badge" },
        "⏱️ Time: ",
        el("strong", { id: "game-timer" }, formatTime(elapsedSeconds)),
      ),
      el(
        "div",
        { className: "status-badge" },
        "🎯 Attempts: ",
        el("strong", {}, String(gameState.history.length)),
      ),
      el(
        "button",
        {
          className: "btn-secondary",
          attrs: { type: "button" },
          on: { click: handleResetGame },
        },
        "New Game 🔄",
      ),
    );

    const feedbackNode = el(
      "div",
      {
        id: "guess-feedback",
        className: `guess-feedback ${feedbackType}`,
      },
      feedbackMessage || "Enter unique digits and press Check or Enter",
    );

    // History Table
    const historyRows = gameState.history.map((entry, index) =>
      el(
        "tr",
        {},
        el("td", {}, String(index + 1)),
        el("td", { className: "code-cell" }, entry.guess.toUpperCase()),
        el("td", {}, el("span", { className: "badge badge-bull" }, `🎯 ${entry.bulls} Bulls`)),
        el("td", {}, el("span", { className: "badge badge-cow" }, `🐮 ${entry.cows} Cows`)),
      ),
    );

    const historyContent =
      gameState.history.length === 0
        ? el(
            "div",
            { className: "history-empty" },
            "No guesses yet. Enter your first attempt above!",
          )
        : el(
            "table",
            { className: "history-table" },
            el(
              "thead",
              {},
              el(
                "tr",
                {},
                el("th", {}, "#"),
                el("th", {}, "Guess"),
                el("th", {}, "Bulls"),
                el("th", {}, "Cows"),
              ),
            ),
            el("tbody", {}, ...historyRows),
          );

    return el(
      "section",
      { className: "card playing-card" },
      statusBar,
      el(
        "div",
        { className: "guess-form" },
        el("div", { className: "input-row" }, inputField, submitBtn),
        feedbackNode,
      ),
      el(
        "div",
        { className: "history-section" },
        el("h3", { className: "card-title" }, "📜 Guess History"),
        historyContent,
      ),
    );
  };

  const renderWinModal = (): HTMLElement => {
    const nameInput = el("input", {
      className: "player-input",
      attrs: {
        type: "text",
        placeholder: "Your Name for Leaderboard",
        maxLength: 20,
        autofocus: true,
      },
    }) as HTMLInputElement;

    return el(
      "div",
      { className: "modal-overlay" },
      el(
        "div",
        { className: "modal-content" },
        el("h2", { className: "modal-title" }, "🎉 Victory!"),
        el(
          "p",
          {},
          "You cracked the secret code: ",
          el("strong", { className: "code-cell" }, gameState.secret.toUpperCase()),
        ),
        el(
          "div",
          { className: "modal-stats" },
          el(
            "div",
            { className: "stat-item" },
            el("span", { className: "stat-label" }, "Attempts"),
            el("span", { className: "stat-value" }, String(gameState.history.length)),
          ),
          el(
            "div",
            { className: "stat-item" },
            el("span", { className: "stat-label" }, "Time Elapsed"),
            el("span", { className: "stat-value" }, formatTime(elapsedSeconds)),
          ),
        ),
        nameInput,
        el(
          "div",
          { className: "modal-actions" },
          el(
            "button",
            {
              className: "btn-primary",
              attrs: { type: "button" },
              on: {
                click: () => handleSaveScore(nameInput.value),
              },
            },
            "Save Score 🏆",
          ),
          el(
            "button",
            {
              className: "btn-secondary",
              attrs: { type: "button" },
              on: {
                click: handleResetGame,
              },
            },
            "Skip & Play Again",
          ),
        ),
      ),
    );
  };

  const renderLeaderboardCard = (): HTMLElement => {
    const rows = leaderboard
      .slice(0, 10)
      .map((record, index) =>
        el(
          "tr",
          {},
          el("td", {}, `#${index + 1}`),
          el("td", { style: { fontWeight: "700" } }, record.playerName),
          el(
            "td",
            {},
            el(
              "span",
              { className: "status-badge" },
              `${getBaseName(record.base).split(" ")[0]}-${record.length}`,
            ),
          ),
          el("td", {}, `${record.attempts} tries`),
          el("td", {}, formatTime(record.elapsedSeconds)),
        ),
      );

    const content =
      leaderboard.length === 0
        ? el(
            "div",
            { className: "leaderboard-empty" },
            "No recorded games yet. Play and make your mark!",
          )
        : el(
            "table",
            { className: "history-table" },
            el(
              "thead",
              {},
              el(
                "tr",
                {},
                el("th", {}, "Rank"),
                el("th", {}, "Player"),
                el("th", {}, "Mode"),
                el("th", {}, "Tries"),
                el("th", {}, "Time"),
              ),
            ),
            el("tbody", {}, ...rows),
          );

    return el(
      "section",
      { className: "card leaderboard-card" },
      el(
        "div",
        { className: "leaderboard-header" },
        el("h2", { className: "card-title" }, "🏆 Hall of Fame (Top 10)"),
        leaderboard.length > 0
          ? el(
              "button",
              {
                className: "btn-secondary",
                attrs: { type: "button" },
                style: { padding: "6px 12px", fontSize: "0.8rem" },
                on: { click: handleClearLeaderboard },
              },
              "Clear 🗑️",
            )
          : null,
      ),
      content,
    );
  };

  const render = (): void => {
    clearElement(root);

    const appContainer = el(
      "div",
      { className: "app-container" },
      el(
        "header",
        { className: "app-header" },
        el("h1", { className: "app-title" }, "🎯 Bulls & Cows"),
        el("p", { className: "app-subtitle" }, "Pure Functional Code-Breaking Game • RS School"),
      ),
      renderSettingsCard(),
      gameState.status !== "settings" ? renderPlayingCard() : null,
      gameState.status === "won" ? renderWinModal() : null,
      renderLeaderboardCard(),
    );

    root.appendChild(appContainer);

    // Focus input field if in playing state
    if (gameState.status === "playing") {
      const input = document.getElementById("guess-input") as HTMLInputElement | null;
      if (input) {
        input.focus();
      }
    }
  };

  render();
};
