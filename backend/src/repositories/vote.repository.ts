import { query } from '../config/database';
import { Vote, VoteRow, SubmitVoteDTO } from '../types';

class VoteRepository {
    async create(data: SubmitVoteDTO): Promise<Vote> {
        try {
            const result = await query<VoteRow>(
                `INSERT INTO votes (poll_id, student_id, option_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
                [data.pollId, data.studentId, data.optionId]
            );

            return this.mapRowToVote(result[0]);
        } catch (error: any) {
            if (error.code === '23505') {
                throw new Error('You have already voted on this poll');
            }
            throw error;
        }
    }

    async hasVoted(pollId: string, studentId: string): Promise<boolean> {
        const result = await query<{ exists: boolean }>(
            `SELECT EXISTS(
        SELECT 1 FROM votes 
        WHERE poll_id = $1 AND student_id = $2
      ) as exists`,
            [pollId, studentId]
        );

        return result[0].exists;
    }

    async getVotesByPollId(pollId: string): Promise<Vote[]> {
        const result = await query<VoteRow>(
            'SELECT * FROM votes WHERE poll_id = $1',
            [pollId]
        );

        return result.map((row) => this.mapRowToVote(row));
    }

    async getVoteCountsByPollId(
        pollId: string
    ): Promise<{ optionId: string; count: number }[]> {
        const result = await query<{ option_id: string; count: string }>(
            `SELECT option_id, COUNT(*) as count
       FROM votes
       WHERE poll_id = $1
       GROUP BY option_id`,
            [pollId]
        );

        return result.map((row) => ({
            optionId: row.option_id,
            count: parseInt(row.count, 10),
        }));
    }

    async getTotalVoteCount(pollId: string): Promise<number> {
        const result = await query<{ count: string }>(
            'SELECT COUNT(*) as count FROM votes WHERE poll_id = $1',
            [pollId]
        );

        return parseInt(result[0].count, 10);
    }

    private mapRowToVote(row: VoteRow): Vote {
        return {
            id: row.id,
            pollId: row.poll_id,
            studentId: row.student_id,
            optionId: row.option_id,
            votedAt: row.voted_at,
        };
    }
}

export default new VoteRepository();
