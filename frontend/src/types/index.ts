// Poll types - matches backend
export interface Poll {
    id: string;
    question: string;
    durationSeconds: number;
    status: PollStatus;
    startedAt: string | null; // ISO timestamp
    endedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export type PollStatus = 'CREATED' | 'ACTIVE' | 'ENDED';

export interface PollOption {
    id: string;
    pollId: string;
    optionText: string;
    optionIndex: number;
    createdAt: string;
}

export interface PollWithOptions extends Poll {
    options: PollOption[];
}

export interface CreatePollDTO {
    question: string;
    options: string[];
    durationSeconds: number;
    correctOptionIndex?: number;
}

// Student types
export interface Student {
    id: string;
    name: string;
    sessionId: string;
    createdAt: string;
    lastSeenAt: string;
}

export interface CreateStudentDTO {
    name: string;
    sessionId: string;
}

// Vote types
export interface SubmitVoteDTO {
    pollId: string;
    studentId: string;
    optionId: string;
}

// Results types
export interface OptionResult {
    optionId: string;
    optionText: string;
    count: number;
    percentage: number;
}

export interface PollResults {
    pollId: string;
    totalVotes: number;
    options: OptionResult[];
}

// Poll state from sync endpoint
export interface PollState {
    poll: PollWithOptions | null;
    serverTime: string;
    hasVoted: boolean;
    results: PollResults | null;
}

// UI State
export type UserRole = 'teacher' | 'student';
