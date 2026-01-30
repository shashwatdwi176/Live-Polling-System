import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STUDENT_ID_KEY = 'live_polling_student_id';
const STUDENT_NAME_KEY = 'live_polling_student_name';
const SESSION_ID_KEY = 'live_polling_session_id';

/**
 * Hook to manage student session persistence
 */
export function useStudentSession() {
    const [studentId, setStudentId] = useState<string | null>(null);
    const [studentName, setStudentName] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        // Load from localStorage on mount
        const savedStudentId = localStorage.getItem(STUDENT_ID_KEY);
        const savedName = localStorage.getItem(STUDENT_NAME_KEY);
        const savedSessionId = localStorage.getItem(SESSION_ID_KEY);

        if (savedStudentId && savedName && savedSessionId) {
            setStudentId(savedStudentId);
            setStudentName(savedName);
            setSessionId(savedSessionId);
            setIsRegistered(true);
        } else {
            // Generate new session ID if not exists
            const newSessionId = uuidv4();
            setSessionId(newSessionId);
            localStorage.setItem(SESSION_ID_KEY, newSessionId);
        }
    }, []);

    const registerStudent = (id: string, name: string) => {
        setStudentId(id);
        setStudentName(name);
        setIsRegistered(true);

        // Persist to localStorage
        localStorage.setItem(STUDENT_ID_KEY, id);
        localStorage.setItem(STUDENT_NAME_KEY, name);
    };

    const clearSession = () => {
        setStudentId(null);
        setStudentName(null);
        setIsRegistered(false);

        localStorage.removeItem(STUDENT_ID_KEY);
        localStorage.removeItem(STUDENT_NAME_KEY);
        // Keep sessionId for tracking
    };

    return {
        studentId,
        studentName,
        sessionId,
        isRegistered,
        registerStudent,
        clearSession,
    };
}
