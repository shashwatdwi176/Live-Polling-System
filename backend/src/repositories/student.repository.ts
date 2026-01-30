import { query } from '../config/database';
import { Student, StudentRow, CreateStudentDTO } from '../types';

class StudentRepository {
    async create(data: CreateStudentDTO): Promise<Student> {
        const result = await query<StudentRow>(
            `INSERT INTO students (name, session_id)
       VALUES ($1, $2)
       RETURNING *`,
            [data.name, data.sessionId]
        );

        return this.mapRowToStudent(result[0]);
    }

    async findById(id: string): Promise<Student | null> {
        const result = await query<StudentRow>(
            'SELECT * FROM students WHERE id = $1',
            [id]
        );

        return result.length > 0 ? this.mapRowToStudent(result[0]) : null;
    }

    async findBySessionId(sessionId: string): Promise<Student | null> {
        const result = await query<StudentRow>(
            'SELECT * FROM students WHERE session_id = $1',
            [sessionId]
        );

        return result.length > 0 ? this.mapRowToStudent(result[0]) : null;
    }

    async updateLastSeen(id: string): Promise<void> {
        await query(
            'UPDATE students SET last_seen_at = NOW() WHERE id = $1',
            [id]
        );
    }

    async findAll(): Promise<Student[]> {
        const result = await query<StudentRow>(
            'SELECT * FROM students ORDER BY created_at DESC'
        );

        return result.map((row) => this.mapRowToStudent(row));
    }

    private mapRowToStudent(row: StudentRow): Student {
        return {
            id: row.id,
            name: row.name,
            sessionId: row.session_id,
            createdAt: row.created_at,
            lastSeenAt: row.last_seen_at,
        };
    }
}

export default new StudentRepository();
