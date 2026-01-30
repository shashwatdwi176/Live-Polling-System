-- Live Polling System Database Schema
-- PostgreSQL version 12+

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS poll_options CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS polls CASCADE;

-- Polls table
CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0 AND duration_seconds <= 60),
    status VARCHAR(20) NOT NULL CHECK (status IN ('CREATED', 'ACTIVE', 'ENDED')),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Poll options table
CREATE TABLE poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(poll_id, option_index)
);

-- Students table (session tracking)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes table with critical unique constraint for duplicate prevention
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- CRITICAL: Prevents duplicate votes even under race conditions
    UNIQUE(poll_id, student_id)
);

-- Indexes for performance
CREATE INDEX idx_polls_status ON polls(status);
CREATE INDEX idx_polls_started_at ON polls(started_at);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_student_id ON votes(student_id);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX idx_students_session_id ON students(session_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on polls table
CREATE TRIGGER update_polls_updated_at
    BEFORE UPDATE ON polls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE polls IS 'Stores poll questions and metadata';
COMMENT ON TABLE poll_options IS 'Stores options for each poll';
COMMENT ON TABLE students IS 'Tracks student sessions';
COMMENT ON TABLE votes IS 'Stores student votes with duplicate prevention';
COMMENT ON CONSTRAINT votes_poll_id_student_id_key ON votes IS 'CRITICAL: Ensures one vote per student per poll at database level';
