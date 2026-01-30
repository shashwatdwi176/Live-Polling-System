import { useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useStudentSession } from '../../hooks/useStudentSession';

export function StudentLogin() {
  const [name, setName] = useState('');
  const { socket } = useSocket();
  const { sessionId, registerStudent } = useStudentSession();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!socket || !name.trim() || !sessionId) {
      return;
    }

    socket.emit('student:register', {
      name: name.trim(),
      sessionId,
    });

    socket.once('student:registered', (student) => {
      registerStudent(student.id, student.name);
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="intervue-badge">INTERVUE</span>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '16px',
            color: '#373737'
          }}>
            Let's Get Started
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#86868B',
            lineHeight: '1.6'
          }}>
            If you're a student, you'll be able to submit your answers, track quizzes in live 
            polls, and see how many responses compared with your classmates.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '32px' }}>
            <label className="form-label">Enter your Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={100}
              required
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <button type="submit" className="btn-primary">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
