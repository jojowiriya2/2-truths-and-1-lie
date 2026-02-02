import React, { useState } from 'react';
import { Player, Statement, ConnectedUser } from '../types';
import './GameSetup.css';
import { addPlayer as addPlayerToStorage, setUserSubmittedStatements } from '../miroStorage';

interface GameSetupProps {
  onStartGame: (players: Player[]) => void;
  currentUserId: string;
  players: Player[]; // Synced from Miro storage
  connectedUsers: ConnectedUser[];
  isHost: boolean;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, currentUserId, players, connectedUsers, isHost }) => {
  const [playerName, setPlayerName] = useState('');
  const [statement1, setStatement1] = useState('');
  const [statement2, setStatement2] = useState('');
  const [statement3, setStatement3] = useState('');
  const [lieIndex, setLieIndex] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = connectedUsers.find(u => u.userId === currentUserId);
  const allSubmitted = connectedUsers.length > 0 && connectedUsers.every(u => u.hasSubmittedStatements);

  const addPlayer = async () => {
    console.log('Add player clicked, currentUserId:', currentUserId);

    // Prevent submission if already submitting
    if (isSubmitting) {
      return;
    }

    // Prevent multiple submissions - check both flags
    if (currentUser?.hasSubmittedStatements) {
      alert("You've already submitted your statements!");
      return;
    }

    // Also check if user already has a player in the players array
    const existingPlayer = players.find(p => p.createdBy === currentUserId);
    if (existingPlayer) {
      console.log('User already has a player, preventing duplicate');
      alert("You've already submitted your statements!");
      return;
    }

    if (!playerName.trim() || !statement1.trim() || !statement2.trim() || !statement3.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (!currentUserId) {
      alert('User ID not loaded yet. Please wait a moment and try again.');
      return;
    }

    // Set loading state and mark user as submitted IMMEDIATELY to prevent double-clicks
    setIsSubmitting(true);
    await setUserSubmittedStatements(currentUserId, true);

    const statements: Statement[] = [
      {
        id: `${Date.now()}-1`,
        text: statement1,
        isLie: lieIndex === 0,
      },
      {
        id: `${Date.now()}-2`,
        text: statement2,
        isLie: lieIndex === 1,
      },
      {
        id: `${Date.now()}-3`,
        text: statement3,
        isLie: lieIndex === 2,
      },
    ];

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: playerName,
      statements,
      score: 0,
      createdBy: currentUserId, // Track who created this player
    };

    // Add to Miro storage (will sync to all users)
    await addPlayerToStorage(newPlayer);

    // Reset form
    setPlayerName('');
    setStatement1('');
    setStatement2('');
    setStatement3('');
    setLieIndex(1);
  };

  const startGame = () => {
    if (players.length < 2) {
      alert('You need at least 2 players to start the game');
      return;
    }
    onStartGame(players);
  };

  return (
    <div className="game-setup">
      <div className="setup-container">
        <div className="setup-form">
          {currentUser?.hasSubmittedStatements ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h2 style={{ color: '#4caf50', marginBottom: '1rem' }}>✓ Statements Submitted!</h2>
              <p style={{ fontSize: '1.1rem', color: '#666' }}>
                Your statements have been saved. Waiting for other players to submit...
              </p>
            </div>
          ) : (
            <>
              <h2>Submit Your Statements</h2>
              <p className="form-description">
                Enter your name and three statements (2 truths and 1 lie)
              </p>

              <div className="form-group">
                <label>Player Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter player name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Statement 1 {lieIndex === 0 && <span className="lie-badge">This is the lie</span>}</label>
                <input
                  type="text"
                  value={statement1}
                  onChange={(e) => setStatement1(e.target.value)}
                  placeholder="Enter first statement"
                  className="form-input"
                />
                <label className="radio-label">
                  <input
                    type="radio"
                    checked={lieIndex === 0}
                    onChange={() => setLieIndex(0)}
                  />
                  This is a lie
                </label>
              </div>

              <div className="form-group">
                <label>Statement 2 {lieIndex === 1 && <span className="lie-badge">This is the lie</span>}</label>
                <input
                  type="text"
                  value={statement2}
                  onChange={(e) => setStatement2(e.target.value)}
                  placeholder="Enter second statement"
                  className="form-input"
                />
                <label className="radio-label">
                  <input
                    type="radio"
                    checked={lieIndex === 1}
                    onChange={() => setLieIndex(1)}
                  />
                  This is a lie
                </label>
              </div>

              <div className="form-group">
                <label>Statement 3 {lieIndex === 2 && <span className="lie-badge">This is the lie</span>}</label>
                <input
                  type="text"
                  value={statement3}
                  onChange={(e) => setStatement3(e.target.value)}
                  placeholder="Enter third statement"
                  className="form-input"
                />
                <label className="radio-label">
                  <input
                    type="radio"
                    checked={lieIndex === 2}
                    onChange={() => setLieIndex(2)}
                  />
                  This is a lie
                </label>
              </div>

              <button
                onClick={addPlayer}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Statements'}
              </button>
            </>
          )}
        </div>

        <div className="players-list">
          <h2>Submission Status</h2>
          <div className="submission-list">
            {connectedUsers.map((user) => (
              <div key={user.userId} className={`submission-item ${user.hasSubmittedStatements ? 'submitted' : 'pending'}`}>
                <span className="user-name">
                  {user.userName} {user.userId === currentUserId && '(You)'}
                </span>
                <span className="submission-status">
                  {user.hasSubmittedStatements ? '✓ Submitted' : '⏳ Not Submitted'}
                </span>
              </div>
            ))}
          </div>

          {isHost && allSubmitted && players.length >= 2 && (
            <button onClick={startGame} className="btn btn-primary btn-large">
              Start Game
            </button>
          )}

          {!isHost && allSubmitted && players.length >= 2 && (
            <button onClick={startGame} className="btn btn-primary btn-large" style={{marginTop: '1rem'}}>
              Start Game (All Ready)
            </button>
          )}

          {!allSubmitted && (
            <p className="waiting-host-message">Waiting for all players to submit...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameSetup;
