import React, { useEffect } from 'react';
import { Player, Vote, ConnectedUser } from '../types';
import './VotingPanel.css';

interface VotingPanelProps {
  player: Player;
  onVote: (statementId: string) => void;
  onShowResults: () => void;
  currentUserId: string;
  votes: Vote[];
  connectedUsers: ConnectedUser[];
  isHost: boolean;
}

const VotingPanel: React.FC<VotingPanelProps> = ({
  player,
  onVote,
  onShowResults,
  currentUserId,
  votes,
  connectedUsers,
}) => {
  const isOwner = player.createdBy === currentUserId;
  const hasVoted = votes.some(v => v.playerId === currentUserId);
  const myVote = votes.find(v => v.playerId === currentUserId);

  // Count votes for each statement
  const voteCounts = player.statements.map(statement => ({
    statementId: statement.id,
    count: votes.filter(v => v.statementId === statement.id).length,
  }));

  // How many people should vote (everyone except the owner)
  const expectedVoters = connectedUsers.filter(u => u.userId !== player.createdBy).length;
  const actualVoters = votes.length;
  const allVoted = actualVoters >= expectedVoters;

  // Auto-show results when all votes are in
  useEffect(() => {
    if (allVoted && expectedVoters > 0) {
      // Small delay to let users see the final vote count
      const timer = setTimeout(() => {
        onShowResults();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allVoted, expectedVoters, onShowResults]);

  const handleVote = (statementId: string) => {
    if (isOwner || hasVoted) return;
    onVote(statementId);
  };

  return (
    <div className="voting-panel">
      <div className="voting-card">
        <h2>{player.name}'s Question</h2>
        {isOwner ? (
          <p className="voting-instructions owner-message">
            Read your statements out loud to the other players! You cannot vote on your own question. Wait for others to finish voting.
          </p>
        ) : (
          <p className="voting-instructions">
            Which one do you think is the lie? Click to vote!
          </p>
        )}

        <div className="voting-options">
          {player.statements.map((statement, index) => {
            const voteCount = voteCounts.find(vc => vc.statementId === statement.id)?.count || 0;
            const isMyVote = myVote?.statementId === statement.id;

            return (
              <div
                key={statement.id}
                className={`voting-option ${isMyVote ? 'selected' : ''} ${
                  isOwner ? 'disabled owner-disabled' : hasVoted ? 'disabled' : ''
                }`}
                onClick={() => handleVote(statement.id)}
              >
                <div className="option-number">{index + 1}</div>
                <div className="option-text">{statement.text}</div>
                <div className="vote-count">
                  {voteCount > 0 && `${voteCount} vote${voteCount > 1 ? 's' : ''}`}
                </div>
                {isMyVote && <div className="checkmark">✓ Your vote</div>}
              </div>
            );
          })}
        </div>

        <div className="voting-status">
          <p>Votes: {actualVoters} / {expectedVoters}</p>
          {!allVoted && !isOwner && !hasVoted && (
            <p className="waiting-message">Click a statement above to vote!</p>
          )}
          {!allVoted && hasVoted && (
            <p className="waiting-message">✓ You voted! Waiting for others...</p>
          )}
          {!allVoted && isOwner && (
            <p className="waiting-message">Waiting for all players to vote...</p>
          )}
          {allVoted && (
            <p className="waiting-message" style={{color: '#4caf50', fontWeight: 600}}>
              All votes received! Showing results...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingPanel;
