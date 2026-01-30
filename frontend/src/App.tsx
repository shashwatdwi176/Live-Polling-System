import { useState } from 'react';
import { TeacherView } from './components/teacher/TeacherView';
import { StudentView } from './components/student/StudentView';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { UserRole } from './types';
import './App.css';

function App() {
  const [role, setRole] = useState<UserRole | null>(null);

  return (
    <ErrorBoundary>
      {!role ? (
        <div className="center-layout">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="intervue-badge">INTERVUE</span>
              <h1 style={{ marginBottom: '1rem' }}>
                Welcome to the Live Polling System
              </h1>
              <p style={{ maxWidth: '600px', margin: '0 auto' }}>
                Please select the role that best describes you to begin using the live polling system features.
              </p>
            </div>

            <div className="role-grid">
              <div 
                className={`role-card ${role === 'student' ? 'selected' : ''}`}
                onClick={() => setRole('student')}
              >
                <h3>I'm a Student</h3>
                <p>
                  Create spaces to manage multiple sets of questions along with answering features.
                </p>
              </div>

              <div 
                className={`role-card ${role === 'teacher' ? 'selected' : ''}`}
                onClick={() => setRole('teacher')}
              >
                <h3>I'm a Teacher</h3>
                <p>
                  Manage questions and track your requests from a single space.
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button 
                className="btn-primary"
                disabled
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="app">
          {role === 'teacher' ? <TeacherView /> : <StudentView />}
        </div>
      )}
    </ErrorBoundary>
  );
}

export default App;
