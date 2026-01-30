import { useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { usePollState } from '../../hooks/usePollState';
import { usePollTimer } from '../../hooks/usePollTimer';
import { useStudentSession } from '../../hooks/useStudentSession';

export function PollView() {
  const { studentId } = useStudentSession();
  const { poll, hasVoted, serverTime, results } = usePollState(studentId || undefined);
  const remainingTime = usePollTimer(
    poll?.startedAt || null,
    poll?.durationSeconds || null,
    serverTime
  );
  const { socket } = useSocket();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleVote = () => {
    if (!socket || !poll || !studentId || !selectedOption) return;

    socket.emit('vote:submit', {
      pollId: poll.id,
      studentId,
      optionId: selectedOption,
    });

    socket.once('vote:success', () => {
      setSelectedOption(null);
    });
  };

  // Waiting for poll
  if (!poll) {
    return (
    <div className="center-layout">
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <span className="intervue-badge" style={{ marginBottom: '2rem' }}>INTERVUE</span>
        <div className="spinner" style={{ margin: '0 auto 1.5rem', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}></div>
        <p style={{ fontSize: '1.125rem', fontWeight: '500', color: 'var(--text-primary)' }}>
          Wait for the teacher to ask questions..
        </p>
      </div>
    </div>
    );
  }

  const isExpired = remainingTime === 0;
  const canVote = !hasVoted && !isExpired && poll.status === 'ACTIVE';

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span className="intervue-badge">INTERVUE</span>
      </div>

      <div className="question-badge">
        <span className="number">Question 1</span>
        {poll.status === 'ACTIVE' && remainingTime !== null && (
          <span className="timer">00:{remainingTime.toString().padStart(2, '0')}</span>
        )}
      </div>

      <div className="question-header" style={{ marginBottom: '2rem' }}>
        {poll.question}
      </div>

      {canVote ? (
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {poll.options.map((option) => (
              <label
                key={option.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  border: selectedOption === option.id 
                    ? '2px solid var(--primary)' 
                    : '1px solid var(--border)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: selectedOption === option.id 
                    ? 'var(--primary-light)' 
                    : 'white',
                  boxShadow: selectedOption === option.id 
                    ? '0 0 0 1px var(--primary)' 
                    : 'none'
                }}
              >
                <div 
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: selectedOption === option.id ? '6px solid var(--primary)' : '2px solid var(--text-secondary)',
                    boxSizing: 'border-box'
                  }}
                />
                <input
                  type="radio"
                  name="poll-option"
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                  style={{ display: 'none' }}
                />
                <span style={{ flex: 1, fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {option.optionText}
                </span>
              </label>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              className="btn-primary"
              onClick={handleVote}
              disabled={!selectedOption}
              style={{ minWidth: '200px' }}
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div>
          {hasVoted && poll.status === 'ACTIVE' && (
            <div style={{
              background: 'var(--success-bg)',
              color: 'var(--success-text)',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: '600',
              marginBottom: '2rem'
            }}>
              You have voted!
            </div>
          )}

          {isExpired && !hasVoted && (
            <div style={{
              background: 'var(--error-bg)',
              color: 'var(--error-text)',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: '600',
              marginBottom: '2rem'
            }}>
              Time's up!
            </div>
          )}

          <div className="card" style={{ border: 'none', boxShadow: 'none', padding: 0, background: 'transparent' }}>
            {results && results.options.map((option) => (
              <div key={option.optionId} className="progress-bar-horizontal">
                <div className="progress-avatar">
                  {option.optionText.charAt(0)}
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${option.percentage}%` }}
                  >
                    {option.percentage > 10 && option.optionText}
                  </div>
                </div>
                <span className="progress-percentage">{option.percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: 'center',
            marginTop: '2.5rem',
            fontSize: '1rem',
            color: 'var(--text-secondary)'
          }}>
            Wait for the teacher to ask a new question.
          </p>
        </div>
      )}

    </div>
  );
}
