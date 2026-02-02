// Miro Storage API utilities for multiplayer game state synchronization
// Uses Miro's Storage Collection API to sync state across all users on the board

import { GamePhase, Player, Vote, ConnectedUser } from './types';

declare global {
  interface Window {
    miro: any;
  }
}

export interface GameState {
  gamePhase: GamePhase;
  hostUserId: string; // User who started the game
  connectedUsers: ConnectedUser[]; // All users who joined
  players: Player[];
  currentPlayerIndex: number;
  votes: Vote[];
  voterScores: { [userId: string]: number }; // Track score for each voter
  modalOpen: boolean; // Signal to open modal for all users
}

const STORAGE_KEY = 'game-state';

/**
 * Initialize game state in Miro storage
 */
export async function initializeGameState(hostUserId?: string): Promise<void> {
  const initialState: GameState = {
    gamePhase: 'lobby',
    hostUserId: hostUserId || '',
    connectedUsers: [],
    players: [],
    currentPlayerIndex: 0,
    votes: [],
    voterScores: {},
    modalOpen: false,
  };

  await window.miro.board.storage.collection('gameData').set(STORAGE_KEY, initialState);
}

/**
 * Get current game state from Miro storage
 */
export async function getGameState(): Promise<GameState | null> {
  try {
    const state = await window.miro.board.storage.collection('gameData').get(STORAGE_KEY);
    return state || null;
  } catch (error) {
    console.error('Error getting game state:', error);
    return null;
  }
}

/**
 * Update game state in Miro storage (syncs to all users)
 */
export async function updateGameState(updates: Partial<GameState>): Promise<void> {
  try {
    const currentState = await getGameState();
    if (!currentState) {
      // If no state exists, initialize it
      await initializeGameState();
      return;
    }

    const newState: GameState = {
      ...currentState,
      ...updates,
    };

    await window.miro.board.storage.collection('gameData').set(STORAGE_KEY, newState);
  } catch (error) {
    console.error('Error updating game state:', error);
  }
}

/**
 * Add a player to the game
 */
export async function addPlayer(player: Player): Promise<void> {
  const currentState = await getGameState();
  if (!currentState) {
    await initializeGameState();
    return addPlayer(player);
  }

  const updatedPlayers = [...currentState.players, player];
  await updateGameState({ players: updatedPlayers });
}

/**
 * Remove a player from the game
 */
export async function removePlayer(playerId: string): Promise<void> {
  const currentState = await getGameState();
  if (!currentState) return;

  const updatedPlayers = currentState.players.filter(p => p.id !== playerId);
  await updateGameState({ players: updatedPlayers });
}

/**
 * Submit a vote (adds to existing votes)
 */
export async function submitVote(vote: Vote): Promise<void> {
  const currentState = await getGameState();
  if (!currentState) return;

  // Check if this user already voted
  const existingVoteIndex = currentState.votes.findIndex(v => v.playerId === vote.playerId);
  let updatedVotes: Vote[];

  if (existingVoteIndex >= 0) {
    // Replace existing vote
    updatedVotes = [...currentState.votes];
    updatedVotes[existingVoteIndex] = vote;
  } else {
    // Add new vote
    updatedVotes = [...currentState.votes, vote];
  }

  await updateGameState({ votes: updatedVotes });
}

/**
 * Clear votes (used when moving to next player)
 */
export async function clearVotes(): Promise<void> {
  await updateGameState({ votes: [] });
}

/**
 * Update voter scores based on current votes
 */
export async function updateVoterScores(currentPlayer: Player): Promise<void> {
  const currentState = await getGameState();
  if (!currentState) return;

  const lieStatement = currentPlayer.statements.find(s => s.isLie);
  if (!lieStatement) return;

  // Clone current voter scores
  const updatedVoterScores = { ...currentState.voterScores };

  // Award points to users who voted correctly
  currentState.votes.forEach(vote => {
    if (vote.statementId === lieStatement.id) {
      // Correct guess - add 1 point
      updatedVoterScores[vote.playerId] = (updatedVoterScores[vote.playerId] || 0) + 1;
    }
  });

  await updateGameState({ voterScores: updatedVoterScores });
}

/**
 * Start the game with the given players
 */
export async function startGame(players: Player[]): Promise<void> {
  await updateGameState({
    players,
    gamePhase: 'voting',
    currentPlayerIndex: 0,
    votes: [],
  });
}

/**
 * Move to next player
 */
export async function nextPlayer(): Promise<void> {
  const currentState = await getGameState();
  if (!currentState) return;

  if (currentState.currentPlayerIndex < currentState.players.length - 1) {
    await updateGameState({
      currentPlayerIndex: currentState.currentPlayerIndex + 1,
      gamePhase: 'voting',
      votes: [],
    });
  } else {
    await updateGameState({ gamePhase: 'finished' });
  }
}

/**
 * Reset game to lobby phase while preserving connected users
 */
export async function resetGame(): Promise<void> {
  const currentState = await getGameState();
  if (!currentState) {
    await initializeGameState();
    return;
  }

  // Reset users' ready and submission status
  const resetUsers = currentState.connectedUsers.map(user => ({
    ...user,
    isReady: false,
    hasSubmittedStatements: false,
  }));

  await updateGameState({
    gamePhase: 'lobby',
    players: [],
    currentPlayerIndex: 0,
    votes: [],
    voterScores: {},
    connectedUsers: resetUsers,
  });
}

/**
 * Add or update a connected user
 */
export async function joinGame(userId: string, userName: string): Promise<void> {
  const currentState = await getGameState();
  if (!currentState) return;

  const existingUserIndex = currentState.connectedUsers.findIndex(u => u.userId === userId);
  let updatedUsers: ConnectedUser[];

  if (existingUserIndex >= 0) {
    // User already exists, don't modify
    return;
  } else {
    // Add new user
    const newUser: ConnectedUser = {
      userId,
      userName,
      isReady: false,
      hasSubmittedStatements: false,
    };
    updatedUsers = [...currentState.connectedUsers, newUser];
  }

  await updateGameState({ connectedUsers: updatedUsers });
}

/**
 * Remove a connected user from the game (host only)
 */
export async function removeConnectedUser(userId: string): Promise<void> {
  const currentState = await getGameState();
  if (!currentState) return;

  const updatedUsers = currentState.connectedUsers.filter(u => u.userId !== userId);
  await updateGameState({ connectedUsers: updatedUsers });
}

/**
 * Mark user as ready
 */
export async function setUserReady(userId: string, isReady: boolean): Promise<void> {
  const currentState = await getGameState();
  if (!currentState) {
    return;
  }

  const updatedUsers = currentState.connectedUsers.map(user =>
    user.userId === userId ? { ...user, isReady } : user
  );

  await updateGameState({ connectedUsers: updatedUsers });
}

/**
 * Mark user as having submitted statements
 */
export async function setUserSubmittedStatements(userId: string, hasSubmitted: boolean): Promise<void> {
  const currentState = await getGameState();
  if (!currentState) return;

  const updatedUsers = currentState.connectedUsers.map(user =>
    user.userId === userId ? { ...user, hasSubmittedStatements: hasSubmitted } : user
  );

  await updateGameState({ connectedUsers: updatedUsers });
}

/**
 * Open modal for all users
 */
export async function openModalForAll(): Promise<void> {
  await updateGameState({ modalOpen: true });
}

/**
 * Close modal signal
 */
export async function closeModalSignal(): Promise<void> {
  await updateGameState({ modalOpen: false });
}

/**
 * Subscribe to game state changes (real-time updates)
 * Returns an unsubscribe function
 */
export function subscribeToGameState(callback: (state: GameState) => void): () => void {
  const unsubscribe = window.miro.board.storage
    .collection('gameData')
    .onValue(STORAGE_KEY, (value: GameState) => {
      if (value) {
        callback(value);
      }
    });

  return unsubscribe;
}
