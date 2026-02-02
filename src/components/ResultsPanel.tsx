import React from 'react';
import { Player, Vote } from '../types';
import './ResultsPanel.css';

interface ResultsPanelProps {
  player: Player;
  votes: Vote[];
  onNextPlayer: () => void;
  currentPlayerIndex: number;
  totalPlayers: number;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  player,
  votes,
  onNextPlayer,
  currentPlayerIndex,
  totalPlayers,
}) => {
  const lieStatement = player.statements.find((s) => s.isLie);
  const correctVoters = votes.filter((v) => v.statementId === lieStatement?.id);
  const incorrectVoters = votes.filter((v) => v.statementId !== lieStatement?.id);
  const isLastPlayer = currentPlayerIndex >= totalPlayers - 1;

  return (
    <div className="results-panel">
      <div className="results-card">
        <h2>Results for {player.name}</h2>
        <p className="player-progress">Player {currentPlayerIndex + 1} of {totalPlayers}</p>

        <div className="reveal-section">
          <h3>The Lie Was:</h3>
          <div className="lie-reveal">
            {lieStatement?.text}
          </div>
        </div>

        <div className="statements-results">
          <h3>All Statements:</h3>
          {player.statements.map((statement, index) => (
            <div
              key={statement.id}
              className={`result-statement ${statement.isLie ? 'is-lie' : 'is-truth'}`}
            >
              <div className="result-number">{index + 1}</div>
              <div className="result-content">
                <div className="result-text">{statement.text}</div>
                <div className="result-label">
                  {statement.isLie ? '❌ Lie' : '✓ Truth'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="voting-summary">
          <div className="summary-column">
            <h4>Correct Guesses ({correctVoters.length})</h4>
            {correctVoters.length === 0 ? (
              <p className="empty-list">No one guessed correctly</p>
            ) : (
              <ul className="voters-list">
                {correctVoters.map((vote) => (
                  <li key={vote.playerId} className="voter-item correct">
                    ✓ {vote.playerName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="summary-column">
            <h4>Incorrect Guesses ({incorrectVoters.length})</h4>
            {incorrectVoters.length === 0 ? (
              <p className="empty-list">Everyone guessed correctly!</p>
            ) : (
              <ul className="voters-list">
                {incorrectVoters.map((vote) => (
                  <li key={vote.playerId} className="voter-item incorrect">
                    ✗ {vote.playerName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="results-actions">
          <button onClick={onNextPlayer} className="btn btn-primary">
            {isLastPlayer ? 'View Final Results' : 'Next Player'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
