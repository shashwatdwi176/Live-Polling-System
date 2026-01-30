import { useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import type { CreatePollDTO } from '../../types';

export function PollCreator() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);
  const [isCorrectIndex, setIsCorrectIndex] = useState<number | null>(null);
  const { socket } = useSocket();

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
      if (isCorrectIndex === index) setIsCorrectIndex(null);
      if (isCorrectIndex !== null && isCorrectIndex > index) setIsCorrectIndex(isCorrectIndex - 1);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    if (!socket) return;

    const validOptions = options.filter((opt) => opt.trim().length > 0);
    if (question.trim().length === 0 || validOptions.length < 2) {
      return;
    }

    const pollData: CreatePollDTO = {
      question: question.trim(),
      options: validOptions,
      durationSeconds: duration,
      correctOptionIndex: isCorrectIndex ?? undefined,
    };

    socket.emit('poll:create', pollData);

    socket.once('poll:created', (poll) => {
      // Auto-start the poll
      socket.emit('poll:start', poll.id);
      
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setDuration(60);
      setIsCorrectIndex(null);
    });
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <span className="intervue-badge">INTERVUE</span>
        <h1 style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>
          Let's Get Started
        </h1>
        <p>
          You'll have the ability to create your first poll, ask questions, and options to 
          your students. Responses are matched in real time.
        </p>
      </div>

      <div className="card">
        <div className="form-group">
          <label className="form-label">Enter your question</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              className="form-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What is your question?"
              maxLength={200}
              style={{ flex: 1 }}
            />
            <select
              className="form-select"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              style={{ width: '160px' }}
            >
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={45}>45 seconds</option>
              <option value={60}>60 seconds</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Options</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {options.map((option, index) => (
              <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                  <input
                    type="radio"
                    name="correct-option"
                    checked={isCorrectIndex === index}
                    onChange={() => setIsCorrectIndex(index)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    title="Mark as correct answer"
                  />
                </div>
                <input
                  type="text"
                  className="form-input"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  style={{ flex: 1 }}
                />
                {options.length > 2 && (
                   <button 
                     onClick={() => removeOption(index)}
                     style={{ 
                       background: 'transparent', 
                       border: 'none', 
                       color: '#EF4444', 
                       fontSize: '1.25rem', 
                       cursor: 'pointer',
                       padding: '0 0.5rem',
                       transition: 'color 0.2s'
                     }}
                     className="hover:text-red-700"
                   >
                     ×
                   </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {options.length < 10 && (
          <button
            onClick={addOption}
            className="btn-secondary"
            style={{ marginBottom: '2rem' }}
          >
            + add more options
          </button>
        )}

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={handleCreate} 
            className="btn-primary"
            style={{ minWidth: '200px' }}
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
}
