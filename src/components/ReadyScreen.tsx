import React, { useState } from 'react';
import { ConnectedUser } from '../types';
import './ReadyScreen.css';

interface ReadyScreenProps {
  connectedUsers: ConnectedUser[];
  currentUserId: string;
  isHost: boolean;
  onReady: () => void;
  onStartSetup: () => void;
}

const ReadyScreen: React.FC<ReadyScreenProps> = ({
  connectedUsers,
  currentUserId,
  isHost,
  onReady,
  onStartSetup,
}) => {
  const [isReadyLoading, setIsReadyLoading] = useState(false);
  const currentUser = connectedUsers.find(u => u.userId === currentUserId);

  const handleReady = async () => {
    setIsReadyLoading(true);
    await onReady();
    // Keep loading state until the user's ready status updates from storage
    // The button will be hidden when currentUser.isReady becomes true
  };

  return (
    <div className="ready-screen">
      <div className="ready-card">
        <h2>Game Lobby</h2>
        <p className="lobby-description">
          {isHost
            ? "You are the HOST. You can start the game anytime."
            : "You are a PLAYER. Wait for the host to start the game."}
        </p>
        <p style={{color: '#999', fontSize: '0.9rem', textAlign: 'center'}}>
          Debug: isHost={isHost ? 'true' : 'false'}
        </p>

        <div className="players-list">
          <h3>Players ({connectedUsers.length})</h3>
          {connectedUsers.map((user) => (
            <div key={user.userId} className={`player-item ${user.isReady ? 'ready' : 'not-ready'}`}>
              <span className="player-name">
                {user.userName} {user.userId === currentUserId && '(You)'}
              </span>
              <span className="ready-status">
                {user.isReady ? '✓ Ready' : '⏳ Not Ready'}
              </span>
            </div>
          ))}
        </div>

        <div className="ready-actions">
          {!currentUser?.isReady && !isHost ? (
            <button
              onClick={handleReady}
              className="btn btn-primary btn-large"
              disabled={isReadyLoading}
            >
              {isReadyLoading ? 'Marking as ready...' : "I'm Ready!"}
            </button>
          ) : !isHost ? (
            <div className="waiting-message">
              <p>✓ You're ready! Waiting for host to start...</p>
            </div>
          ) : null}

          {isHost && (
            <button onClick={onStartSetup} className="btn btn-primary btn-large">
              Start Game Setup
            </button>
          )}

          {/* Emergency start button if no host */}
          {!isHost && connectedUsers.length >= 2 && (
            <button
              onClick={onStartSetup}
              className="btn btn-secondary btn-large"
              style={{marginTop: '1rem'}}
            >
              Force Start (No Host Detected)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadyScreen;
