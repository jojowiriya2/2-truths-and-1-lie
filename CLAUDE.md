# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Miro board application implementing the "2 Truths and 1 Lie" party game. It's a collaborative multiplayer game where players submit three statements (two truths and one lie), and others vote to identify the lie. The app runs inside Miro boards using the Miro Web SDK 2.0.

**Tech Stack:**
- React 18 with TypeScript
- Vite (build tool and dev server)
- Miro Web SDK 2.0
- CSS3 with modern styling

## Development Commands

### Running the App
```bash
npm start          # Start Vite dev server on http://localhost:3000
npm run build      # TypeScript compile + Vite production build to dist/
npm run preview    # Preview production build locally
```

### Development Notes
- Dev server must run on port 3000 to match the Miro app redirect URI
- The app MUST be accessed from within a Miro board (not standalone in browser)
- Miro SDK is loaded via CDN script tag in index.html

## Application Architecture

### State Management Pattern - **MULTIPLAYER SYNCHRONIZED**
Game state is **synchronized across all users** on the Miro board using Miro's Storage Collection API. The app uses a hybrid approach:

- **Shared State** (synced via Miro storage in [miroStorage.ts](src/miroStorage.ts)):
  - `gamePhase`: Controls which component renders
  - `players`: Array of Player objects
  - `currentPlayerIndex`: Tracks whose turn it is
  - `votes`: Array of ALL votes from ALL users
  - `voterScores`: Object mapping userId to their score (points for correct guesses)

- **Local State** (user-specific in [App.tsx](src/App.tsx)):
  - `currentUserId`/`currentUserName`: Obtained from Miro SDK

**How Sync Works:**
1. All state updates go through [miroStorage.ts](src/miroStorage.ts) functions
2. Miro's `storage.collection().set()` writes to board storage (max 64 KB per key)
3. `storage.collection().onValue()` listener fires real-time updates to all connected users
4. Each user's React state automatically updates when storage changes

### Game Flow State Machine
```
setup → playing → voting → results → [next player OR finished]
```

Each phase renders a different component:
1. **setup**: [GameSetup.tsx](src/components/GameSetup.tsx) - Add players and their statements
2. **playing**: [GameBoard.tsx](src/components/GameBoard.tsx) - Display current player's statements
3. **voting**: [VotingPanel.tsx](src/components/VotingPanel.tsx) - Other players vote on the lie
4. **results**: [ResultsPanel.tsx](src/components/ResultsPanel.tsx) - Show vote results and update scores
5. **finished**: Inline component in App.tsx showing final scoreboard

### Miro SDK Integration
The app integrates with Miro boards in three ways:

1. **Panel UI**: The React app runs in a Miro panel (opened via `miro.board.ui.openPanel`)
2. **Board Objects**: Game data is visualized on the board using Miro items (frames, sticky notes, text)
3. **Storage Sync**: Game state is stored in `miro.board.storage.collection()` for real-time multiplayer

**Key Miro SDK Usage:**
- `window.miro.board.getUserInfo()`: Get current user ID/name (used in voting)
- `miro.board.storage.collection('gameData').set()`: Write shared game state
- `miro.board.storage.collection('gameData').get()`: Read shared game state
- `miro.board.storage.collection('gameData').onValue()`: Real-time listener for state changes
- `createGameBoard()` in [App.tsx](src/App.tsx): Creates visual representation on board with sticky notes
- All Miro SDK calls are async and wrapped in try/catch

**Storage Limits:**
- Max 64 KB per storage key
- Storage does NOT persist when boards are copied
- All users on the board can read/write storage

### Type System
[types.ts](src/types.ts) defines the core data structures:
- `Statement`: Individual statement with id, text, and isLie flag
- `Player`: Player with name, statements array, score, and **createdBy** (userId of creator)
- `Vote`: Vote record linking playerId to statementId
- `GamePhase`: Union type controlling UI state machine

**Privacy Feature:**
Each player tracks who created them via `createdBy`. During setup, users can only see their own statements and which one is the lie. Other users see "✓ Ready to play!" but cannot see the statements or answers until the game starts.

### Component Structure
Components follow a consistent pattern:
- Each component has a dedicated .tsx and .css file
- Props interfaces defined inline at top of component file
- No prop drilling beyond one level (App → component)
- All components are functional components with hooks

### Miro App Configuration
- [app-manifest.json](app-manifest.json): Miro app metadata and required scopes (`boards:read`, `boards:write`)
- `.appconfig` file (gitignored): Contains appId, clientSecret, redirectUrl for local development
- The app requires both read and write permissions to create game board visualization

## Code Patterns to Follow

### Adding New Game Phases
1. Add new phase to `GamePhase` union type in [types.ts](src/types.ts)
2. Create component in `src/components/` with matching .css file
3. Add conditional render in [App.tsx](src/App.tsx) main return statement
4. Add state transition logic to connect to existing phases

### Working with Miro SDK
- Always check `window.miro` exists before calling SDK methods
- Wrap all SDK calls in try/catch with console.error fallback
- SDK calls are async - always await them
- Position coordinates: Miro uses x,y origin at center, not top-left

### Styling Conventions
- Component-specific styles in matching .css file
- Global styles in [index.css](src/index.css) and [App.css](src/App.css)
- Button classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-large`
- Color scheme uses gradients and modern CSS (check existing .css files for palette)

## Common Gotchas

1. **Miro SDK not available**: The app will only work inside a Miro board. `window.miro` is undefined in standalone browser.

2. **Multiplayer voting**: Votes are collected from ALL users on the board and stored in shared storage. Each user can vote once per player.

3. **Score system**: The game tracks **voter scores** (who guessed the most lies correctly), NOT player scores. Voters earn 1 point per correct guess.

4. **Storage sync delay**: Miro storage updates are near real-time but not instant. There may be a brief delay (~100-500ms) between one user's action and another seeing the update.

5. **State conflicts**: If two users perform actions simultaneously (e.g., both add a player), the last write wins. No conflict resolution is implemented.

6. **Storage persistence**: Game state is lost when the board is copied. Storage only persists on the original board.

7. **TypeScript strict mode**: The project uses TypeScript 5.3+ with strict checking. All types must be properly defined.

8. **State immutability**: When updating state in storage, always create new objects (miroStorage.ts handles this internally).

9. **Privacy by design**: Each player's statements are only visible to the creator during setup. The `createdBy` field tracks ownership. Users can only delete their own players.
