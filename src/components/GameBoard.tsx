import React from 'react';
import { Player } from '../types';
import './GameBoard.css';

interface GameBoardProps {
  player: Player;
  onContinue: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ player, onContinue }) => {
  return (
    <div className="game-board">
      <div className="game-card">
        <h2>Now Playing: {player.name}</h2>
        <p className="instructions">
          Read the statements below. Two are truths, one is a lie!
        </p>

        <div className="statements-display">
          {player.statements.map((statement, index) => (
            <div key={statement.id} className="statement-card">
              <div className="statement-number">{index + 1}</div>
              <div className="statement-text">{statement.text}</div>
            </div>
          ))}
        </div>

        <div className="actions">
          <button onClick={onContinue} className="btn btn-primary">
            Ready for Voting
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
