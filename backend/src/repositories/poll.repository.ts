import { query } from '../config/database';
import {
    Poll,
    PollWithOptions,
    PollOption,
    PollRow,
    PollOptionRow,
    CreatePollDTO,
    PollStatus,
} from '../types';

class PollRepository {
    async create(data: CreatePollDTO): Promise<PollWithOptions> {
        const pollResult = await query<PollRow>(
            `INSERT INTO polls (question, duration_seconds, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [data.question, data.durationSeconds, 'CREATED']
        );

        const poll = this.mapRowToPoll(pollResult[0]);

        const optionPromises = data.options.map((optionText, index) =>
            query<PollOptionRow>(
                `INSERT INTO poll_options (poll_id, option_text, option_index)
         VALUES ($1, $2, $3)
         RETURNING *`,
                [poll.id, optionText, index]
            )
        );

        const optionResults = await Promise.all(optionPromises);
        const options = optionResults.map((result) =>
            this.mapRowToPollOption(result[0])
        );

        return { ...poll, options };
    }

    async findById(id: string): Promise<PollWithOptions | null> {
        const pollResult = await query<PollRow>(
            'SELECT * FROM polls WHERE id = $1',
            [id]
        );

        if (pollResult.length === 0) return null;

        const poll = this.mapRowToPoll(pollResult[0]);
        const options = await this.getOptionsByPollId(id);

        return { ...poll, options };
    }

    async findActivePoll(): Promise<PollWithOptions | null> {
        const pollResult = await query<PollRow>(
            "SELECT * FROM polls WHERE status = 'ACTIVE' ORDER BY started_at DESC LIMIT 1"
        );

        if (pollResult.length === 0) return null;

        const poll = this.mapRowToPoll(pollResult[0]);
        const options = await this.getOptionsByPollId(poll.id);

        return { ...poll, options };
    }

    async updateStatus(
        id: string,
        status: PollStatus,
        startedAt?: Date,
        endedAt?: Date
    ): Promise<Poll> {
        const updates: string[] = ['status = $2'];
        const values: any[] = [id, status];
        let paramIndex = 3;

        if (startedAt !== undefined) {
            updates.push(`started_at = $${paramIndex}`);
            values.push(startedAt);
            paramIndex++;
        }

        if (endedAt !== undefined) {
            updates.push(`ended_at = $${paramIndex}`);
            values.push(endedAt);
            paramIndex++;
        }

        const result = await query<PollRow>(
            `UPDATE polls SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
            values
        );

        return this.mapRowToPoll(result[0]);
    }

    async getOptionsByPollId(pollId: string): Promise<PollOption[]> {
        const result = await query<PollOptionRow>(
            'SELECT * FROM poll_options WHERE poll_id = $1 ORDER BY option_index',
            [pollId]
        );

        return result.map((row) => this.mapRowToPollOption(row));
    }

    async findAll(): Promise<Poll[]> {
        const result = await query<PollRow>(
            'SELECT * FROM polls ORDER BY created_at DESC'
        );

        return result.map((row) => this.mapRowToPoll(row));
    }

    private mapRowToPoll(row: PollRow): Poll {
        return {
            id: row.id,
            question: row.question,
            durationSeconds: row.duration_seconds,
            status: row.status,
            startedAt: row.started_at,
            endedAt: row.ended_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    private mapRowToPollOption(row: PollOptionRow): PollOption {
        return {
            id: row.id,
            pollId: row.poll_id,
            optionText: row.option_text,
            optionIndex: row.option_index,
            createdAt: row.created_at,
        };
    }
}

export default new PollRepository();
