import { PollCreator } from './PollCreator';
import { LiveResults } from './LiveResults';
import { usePollState } from '../../hooks/usePollState';

export function TeacherView() {
  const { poll, connected } = usePollState();

  if (!connected) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div className="intervue-badge" style={{ background: '#FF9500' }}>
          Connecting...
        </div>
        <p style={{ color: '#86868B' }}>
          Establishing connection to the server...
        </p>
      </div>
    );
  }

  // Show poll creator if no active poll, otherwise show live results
  return poll ? <LiveResults /> : <PollCreator />;
}
