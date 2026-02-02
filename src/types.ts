export interface Statement {
  id: string;
  text: string;
  isLie: boolean;
}

export interface Player {
  id: string;
  name: string;
  statements: Statement[];
  score: number;
  createdBy: string; // Miro userId of the person who created this player
}

export interface ConnectedUser {
  userId: string;
  userName: string;
  isReady: boolean;
  hasSubmittedStatements: boolean;
}

export interface GameSession {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  isActive: boolean;
  votes: Map<string, string>; // voterId -> statementId
}

export interface Vote {
  playerId: string;
  playerName: string;
  statementId: string;
}

export type GamePhase = 'lobby' | 'setup' | 'voting' | 'results' | 'finished';
