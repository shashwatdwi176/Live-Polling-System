// Poll types
export interface Poll {
    id: string;
    question: string;
    durationSeconds: number;
    status: PollStatus;
    startedAt: Date | null;
    endedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type PollStatus = 'CREATED' | 'ACTIVE' | 'ENDED';

export interface PollOption {
    id: string;
    pollId: string;
    optionText: string;
    optionIndex: number;
    createdAt: Date;
}

export interface CreatePollDTO {
    question: string;
    options: string[];
    durationSeconds: number;
}

export interface PollWithOptions extends Poll {
    options: PollOption[];
}

// Student types
export interface Student {
    id: string;
    name: string;
    sessionId: string;
    createdAt: Date;
    lastSeenAt: Date;
}

export interface CreateStudentDTO {
    name: string;
    sessionId: string;
}

// Vote types
export interface Vote {
    id: string;
    pollId: string;
    studentId: string;
    optionId: string;
    votedAt: Date;
}

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

// Poll state for sync endpoint
export interface PollState {
    poll: PollWithOptions | null;
    serverTime: string;
    hasVoted: boolean;
    results: PollResults | null;
}

// Socket event types
export interface SocketEvents {
    // Client -> Server
    'poll:create': (data: CreatePollDTO) => void;
    'poll:start': (pollId: string) => void;
    'poll:end': (pollId: string) => void;
    'vote:submit': (data: SubmitVoteDTO) => void;
    'poll:sync': (data: { studentId?: string }) => void;
    'student:register': (data: CreateStudentDTO) => void;

    // Server -> Client
    'poll:created': (poll: PollWithOptions) => void;
    'poll:started': (data: { poll: PollWithOptions; serverTime: string }) => void;
    'poll:ended': (pollId: string) => void;
    'poll:state': (state: PollState) => void;
    'poll:vote-update': (results: PollResults) => void;
    'vote:success': () => void;
    'vote:error': (error: { message: string }) => void;
    'error': (error: { message: string }) => void;
    'student:registered': (student: Student) => void;
}

// Database row types (snake_case from database)
export interface PollRow {
    id: string;
    question: string;
    duration_seconds: number;
    status: PollStatus;
    started_at: Date | null;
    ended_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface PollOptionRow {
    id: string;
    poll_id: string;
    option_text: string;
    option_index: number;
    created_at: Date;
}

export interface StudentRow {
    id: string;
    name: string;
    session_id: string;
    created_at: Date;
    last_seen_at: Date;
}

export interface VoteRow {
    id: string;
    poll_id: string;
    student_id: string;
    option_id: string;
    voted_at: Date;
}
