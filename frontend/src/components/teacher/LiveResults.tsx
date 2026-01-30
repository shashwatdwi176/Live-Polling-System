import { useState } from 'react';
import { usePollState } from '../../hooks/usePollState';
import { usePollTimer } from '../../hooks/usePollTimer';
import { useSocket } from '../../hooks/useSocket';

export function LiveResults() {
  const { poll, serverTime, results } = usePollState();
  const remainingTime = usePollTimer(
    poll?.startedAt || null,
    poll?.durationSeconds || null,
    serverTime
  );
  const [activeTab, setActiveTab] = useState<'poll' | 'participants'>('poll');
  const { socket } = useSocket();

  const handleEndPoll = () => {
    if (poll && socket) {
      socket.emit('poll:end', poll.id);
    }
  };

  if (!poll) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span className="intervue-badge">INTERVUE</span>
          <p style={{ marginTop: '24px', fontSize: '18px', color: '#86868B' }}>
            No active poll. Create one to get started.
          </p>
        </div>
      </div>
    );
  }

  const isPollEnded = poll.status === 'ENDED';

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span className="intervue-badge">INTERVUE</span>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isPollEnded && (
            <button className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem', cursor: 'default' }}>
              Your poll has ended
            </button>
          )}
          {!isPollEnded && remainingTime !== null && (
            <div className="question-badge">
              <span className="timer">00:{remainingTime.toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'poll' ? 'active' : ''}`}
          onClick={() => setActiveTab('poll')}
        >
          Poll
        </button>
        <button
          className={`tab ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          Participants
        </button>
      </div>

      <div className="question-header">
        {poll.question}
      </div>

      {activeTab === 'poll' && (
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
                  {option.percentage > 15 && option.optionText}
                </div>
              </div>
              <span className="progress-percentage">{option.percentage.toFixed(0)}%</span>
            </div>
          ))}

          {!results && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2.5rem 0' }}>
              Waiting for votes...
            </p>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn-primary" onClick={handleEndPoll}>
              + Ask a question
            </button>
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div>
          <div style={{ padding: '1.25rem 0' }}>
            <p style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Participants ({results?.totalVotes || 0})
            </p>
            {results && results.options.map((option) => (
              <div key={option.optionId} style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="progress-avatar" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                      {option.optionText.charAt(0)}
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{option.optionText}</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{option.count} votes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
    </div>
  );
}
