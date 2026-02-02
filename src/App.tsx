import React, { useState, useEffect } from 'react';
import { GamePhase, Player, Vote, ConnectedUser } from './types';
import ReadyScreen from './components/ReadyScreen';
import GameSetup from './components/GameSetup';
import VotingPanel from './components/VotingPanel';
import ResultsPanel from './components/ResultsPanel';
import PrivacyPolicy from './components/PrivacyPolicy';
import './App.css';
import {
  getGameState,
  initializeGameState,
  subscribeToGameState,
  updateGameState,
  startGame as startGameInStorage,
  nextPlayer as nextPlayerInStorage,
  resetGame as resetGameInStorage,
  submitVote as submitVoteToStorage,
  updateVoterScores,
  joinGame,
  setUserReady,
  openModalForAll,
  removeConnectedUser,
  GameState,
} from './miroStorage';

declare global {
  interface Window {
    miro: any;
  }
}

const App: React.FC = () => {
  // Sync state from Miro storage (shared across all users)
  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby');
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voterScores, setVoterScores] = useState<{ [userId: string]: number }>({});
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Local user info
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState<boolean>(false);

  useEffect(() => {
    // Initialize Miro SDK and setup real-time sync
    const initMiro = async () => {
      try {
        // Get current user info first
        const userInfo = await window.miro.board.getUserInfo();
        setCurrentUserId(userInfo.id);
        setCurrentUserName(userInfo.name);

        // Check if game state already exists
        let state = await getGameState();

        if (!state) {
          // No game exists - this user becomes host and initializes
          await initializeGameState(userInfo.id);
          setIsHost(true);
          state = await getGameState();
        } else {
          // Game exists - check if this user is the host
          setIsHost(state.hostUserId === userInfo.id);
        }

        // Join the game (adds user to connectedUsers if not already there)
        await joinGame(userInfo.id, userInfo.name);

        // Refresh state after joining
        state = await getGameState();

        // Update local state with storage state
        if (state) {
          setGamePhase(state.gamePhase);
          setConnectedUsers(state.connectedUsers);
          setPlayers(state.players);
          setCurrentPlayerIndex(state.currentPlayerIndex);
          setVotes(state.votes);
          setVoterScores(state.voterScores);
          setModalOpen(state.modalOpen);
        }

        // Subscribe to real-time updates from storage
        const unsubscribe = subscribeToGameState((newState: GameState) => {
          setGamePhase(newState.gamePhase);
          setConnectedUsers(newState.connectedUsers);
          setPlayers(newState.players);
          setCurrentPlayerIndex(newState.currentPlayerIndex);
          setVotes(newState.votes);
          setVoterScores(newState.voterScores);

          // Auto-open modal when signal is set
          if (newState.modalOpen && !modalOpen) {
            window.miro.board.ui.openModal({
              url: 'index.html',
              fullscreen: true,
            });
            setModalOpen(true);
          }
        });

        // Register icon:click for everyone (required for icon to show)
        await window.miro.board.ui.on('icon:click', async () => {
          // Host can trigger modal for all users
          if (state && state.hostUserId === userInfo.id) {
            await openModalForAll();
          }
          // Everyone opens their own modal
          await window.miro.board.ui.openModal({
            url: 'index.html',
            fullscreen: true,
          });
        });

        // Cleanup subscription on unmount
        return () => {
          if (unsubscribe) {
            unsubscribe();
          }
        };
      } catch (error) {
        console.error('Failed to initialize Miro:', error);
      }
    };

    if (window.miro) {
      initMiro();
    }
  }, []);

  const handleReady = async () => {
    if (!currentUserId) {
      return;
    }
    await setUserReady(currentUserId, true);
  };

  const handleStartSetup = async () => {
    await updateGameState({ gamePhase: 'setup' });
  };

  const startGame = async (playerList: Player[]) => {
    // Start the game and go straight to voting (skip "playing" phase)
    await startGameInStorage(playerList);
    await updateGameState({ gamePhase: 'voting', votes: [] });
  };

  const submitVote = async (statementId: string) => {
    const newVote: Vote = {
      playerId: currentUserId,
      playerName: currentUserName,
      statementId,
    };
    await submitVoteToStorage(newVote);
  };

  const nextPlayer = async () => {
    // Update voter scores before moving to next player
    if (players[currentPlayerIndex]) {
      await updateVoterScores(players[currentPlayerIndex]);
    }
    await nextPlayerInStorage();
  };

  const showResults = async () => {
    await updateGameState({ gamePhase: 'results' });
  };

  const resetGame = async () => {
    await resetGameInStorage();
  };

  const handleRemovePlayer = async (userId: string) => {
    await removeConnectedUser(userId);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>2 Truths and 1 Lie</h1>
        <p className="subtitle">Collaborative Miro Game</p>
      </header>

      <main className="app-content">
        {gamePhase === 'lobby' && (
          <ReadyScreen
            connectedUsers={connectedUsers}
            currentUserId={currentUserId}
            isHost={isHost}
            onReady={handleReady}
            onStartSetup={handleStartSetup}
            onRemovePlayer={handleRemovePlayer}
          />
        )}

        {gamePhase === 'setup' && (
          <GameSetup
            onStartGame={startGame}
            currentUserId={currentUserId}
            players={players}
            connectedUsers={connectedUsers}
            isHost={isHost}
          />
        )}

        {gamePhase === 'voting' && (
          <VotingPanel
            player={players[currentPlayerIndex]}
            onVote={submitVote}
            onShowResults={showResults}
            currentUserId={currentUserId}
            votes={votes}
            connectedUsers={connectedUsers}
            isHost={isHost}
          />
        )}

        {gamePhase === 'results' && (
          <ResultsPanel
            player={players[currentPlayerIndex]}
            votes={votes}
            onNextPlayer={nextPlayer}
            currentPlayerIndex={currentPlayerIndex}
            totalPlayers={players.length}
            isHost={isHost}
          />
        )}

        {gamePhase === 'finished' && (
          <div className="final-results">
            <h2>Game Over!</h2>
            <div className="scoreboard">
              <h3>Best Detectives - Who Guessed the Most Lies!</h3>
              {Object.entries(voterScores)
                .sort(([, a], [, b]) => b - a)
                .map(([userId, score], index) => {
                  // Find the user name from connected users or votes
                  const user = connectedUsers.find(u => u.userId === userId);
                  const voter = votes.find(v => v.playerId === userId);
                  const voterName = user?.userName || voter?.playerName || `User ${userId.slice(0, 8)}`;

                  return (
                    <div key={userId} className="score-item">
                      <span className="rank">#{index + 1}</span>
                      <span className="player-name">{voterName}</span>
                      <span className="score">{score} correct {score === 1 ? 'guess' : 'guesses'}</span>
                    </div>
                  );
                })}
              {Object.keys(voterScores).length === 0 && (
                <p className="empty-message">No votes were cast!</p>
              )}
            </div>
            {isHost ? (
              <button onClick={resetGame} className="btn btn-primary">
                Play Again
              </button>
            ) : (
              <p className="waiting-message">Waiting for host to start a new game...</p>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <button
          className="privacy-link"
          onClick={() => setShowPrivacyPolicy(true)}
        >
          Privacy Policy
        </button>
      </footer>

      {showPrivacyPolicy && (
        <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />
      )}
    </div>
  );
};

export default App;
