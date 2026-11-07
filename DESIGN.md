# Technical Design Document: Bulls and Cows

This document outlines the architectural decisions, data structures, algorithms, computational complexities, and Clean Code principles applied in this implementation of the **Bulls and Cows** game.

---

## 1. Architectural Overview & Paradigm

The application is structured following **functional programming (FP)** principles:

- **Zero classes in the domain logic:** The game core consists solely of pure functions and immutable data contracts.
- **Decoupled domains:** Game logic (`src/game/`), storage persistence (`src/storage/`), and UI rendering (`src/ui/`) are completely decoupled. The game core has zero dependencies on browser APIs, the DOM, or external packages.
- **Predictable state transitions:** Game state is modified exclusively through pure state transformation functions that return new state copies via structural sharing.
- **Dependency injection for testability:** Non-deterministic dependencies (such as random number generation and system clocks) are passed as function parameters with sensible defaults.

---

## 2. Data Structures & Algorithms

### 2.1 Game State & History

- **Data Structures:**
  - `GameState` (`src/game/types.ts`): An immutable record containing `settings`, `secret`, `history`, `status`, `startTime`, and `endTime`.
  - `history` (`readonly GuessHistoryEntry[]`): An immutable array of attempt objects `{ guess, bulls, cows, timestamp }`.
- **Rationale:**
  - JavaScript arrays and plain objects provide predictable immutability when combined with TypeScript's `readonly` modifiers and ES6 spread syntax (`[...history, newEntry]`).
  - Immutability eliminates bugs related to shared mutable state, enables trivial unit testing, and makes re-rendering deterministic.

### 2.2 `evaluateGuess(secret, guess)` (`src/game/evaluator.ts`)

- **Purpose:** Compares the player's guess against the secret code to return `{ bulls: number, cows: number }`.
- **Algorithm:**
  1. Both strings are converted to lowercase using `.toLowerCase()` to enforce case-insensitivity for hexadecimal digits (`a` vs `A`).
  2. The guess string is split into an array of characters.
  3. **Bulls calculation:** Computed using `.filter((char, index) => char === normalizedSecret[index]).length`. Counts characters matching both digit value and exact index position.
  4. **Cows calculation:** Computed using `.filter((char, index) => char !== normalizedSecret[index] && normalizedSecret.includes(char)).length`. Counts characters existing in the secret whose positions differ from the secret.
  5. Implemented entirely through declarative array higher-order functions (`filter`) without manual loop counters or mutated accumulation variables.

### 2.3 `countPossibleSecrets(length, base)` (`src/game/permutations.ts`)

- **Purpose:** Calculates the total number of unique secret numbers possible for a given code length and number base ($P(base, length) = \frac{base!}{(base - length)!}$).
- **Algorithm:**
  1. Formulated recursively:
     $$\begin{cases} P(base, 0) = 1 & \text{base case} \\ P(base, length) = 0 & \text{if } length < 0 \text{ or } base < 0 \text{ or } length > base \\ P(base, length) = base \times P(base - 1, length - 1) & \text{recursive step} \end{cases}$$
  2. Wrapped with a pure higher-order function `memoize`:
     - Creates a closure with a `Map<string, Return>` cache.
     - Resolves a cache key `${length}:${base}`.
     - On cache hit, returns the stored result in $O(1)$ time.
     - On cache miss, executes the recursive function and caches the result.
  3. Because the recursive step calls `countPossibleSecrets(length - 1, base - 1)`, all intermediate sub-problems are automatically populated in the cache.

---

## 3. Algorithmic Complexity (Big O)

| Function                   |           Time Complexity            | Space Complexity | Justification                                                                                                                                                                                                                                                                                                                                                                                             |
| :------------------------- | :----------------------------------: | :--------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`generateSecret`**       |            $O(k \cdot n)$            |      $O(n)$      | Where $k = \text{length}$, $n = \text{base}$. Tail-recursive selection picks $k$ characters. At each step, filtering the remaining pool takes $O(n)$ time. With maximum constraints ($k \le 6, n \le 16$), the maximum operations count is $\le 96$, running in constant effective time $O(1)$. Stack depth is $O(k)$.                                                                                    |
| **`evaluateGuess`**        |               $O(k^2)$               |      $O(k)$      | Where $k = \text{length}$. The guess is split into an array of length $k$. Filtering for bulls takes $O(k)$ comparisons. Filtering for cows iterates over $k$ elements, calling `.includes()` which takes $O(k)$ worst-case scan. Total time is $O(k^2)$. Because $k \le 6$, maximum comparison count is $\le 36$, executing virtually instantaneously. Memory allocation is $O(k)$ for character arrays. |
| **`isValidGuess`**         |            $O(k \cdot n)$            |      $O(k)$      | Where $k = \text{length}$, $n = \text{base}$. Checks exact string length ($O(1)$). Executes `.every(isDigit)` across $k$ characters, where each predicate lookup takes $O(n)$ against the base alphabet. Constructs a `Set` from $k$ characters to ensure uniqueness ($O(k)$). Total time is $O(k \cdot n)$. Set storage requires $O(k)$ space.                                                           |
| **`countPossibleSecrets`** | $O(1)$ amortized / $O(k)$ worst-case |  $O(n \cdot k)$  | Where $k = \text{length}$, $n = \text{base}$. On initial cold call, recursion executes $k$ iterations with constant-time multiplication at each step ($O(k)$). On subsequent calls with identical arguments, the memoization map returns cached results in $O(1)$ time. Cache memory is bounded by the permutation of valid inputs ($(6 \times 4) = 24$ combinations).                                    |

---

## 4. Clean Code Principles & Applied Practices

### 4.1 Single Responsibility Principle (SRP)

- Each module has one distinct domain:
  - `src/game/validator.ts`: Validates individual digits and complete guess strings.
  - `src/game/generator.ts`: Pure secret generation from an alphabet pool.
  - `src/game/evaluator.ts`: String comparison producing match metrics.
  - `src/game/permutations.ts`: Mathematical permutations and memoization logic.
  - `src/game/state.ts`: Immutable state transitions (`startNewGame`, `processGuess`, `resetGame`).
  - `src/storage/leaderboard.ts`: LocalStorage serialization, error boundaries, and score sorting.
  - `src/ui/dom.ts`: Low-level declarative DOM element construction.

### 4.2 Immutability & Pure Functions

- **Pure Functions:** Functions like `evaluateGuess`, `createDigitValidator`, and `countPossibleSecrets` contain no side effects, rely solely on their explicit parameters, and always return identical outputs for identical inputs.
- **Dependency Injection:** `generateSecret` takes an optional `random: () => number` parameter, and `processGuess` takes `now: () => number`. This makes tests 100% deterministic without monkey-patching global objects.
- **Immutable State Updates:** In `src/game/state.ts`, attempt records are appended via `history: [...state.history, newEntry]`. The original state object is never mutated.

### 4.3 Higher-Order Functions & Currying

- **Curried Factory:** `createDigitValidator(base)` returns a reusable predicate `(char: string) => boolean`. This avoids recalculating the allowed alphabet on every keystroke and allows the same validator to be used in two distinct places:
  1. Batch validation in `isValidGuess`.
  2. Live event filtering on keyboard inputs in `src/ui/app.ts`.
- **Generic Memoization:** `memoize` in `src/game/permutations.ts` abstracts caching logic cleanly without leaking state into the mathematical formula.

### 4.4 Don't Repeat Yourself (DRY)

- Sorting logic for high scores is centralized in `sortLeaderboard` (`src/storage/leaderboard.ts`), reused both during insertion of new records and loading of historical records.
- Base-specific alphabet slicing is centralized in `createDigitValidator` and `generateSecret`.

### 4.5 Defensive Programming & Security

- **No `innerHTML` / `insertAdjacentHTML`:** All DOM elements in `src/ui/` are constructed via `document.createElement`, `document.createTextNode`, and standard property assignments (`src/ui/dom.ts`). This completely eliminates Cross-Site Scripting (XSS) attack vectors.
- **Safe Storage Access:** `src/storage/leaderboard.ts` wraps `localStorage.getItem` and `JSON.parse` in `try / catch` blocks to ensure corrupt stored data or disabled storage cookies will never cause the application to crash.
