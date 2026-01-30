import studentRepository from '../repositories/student.repository';
import { CreateStudentDTO, Student } from '../types';

class StudentService {
    async registerStudent(data: CreateStudentDTO): Promise<Student> {
        const existing = await studentRepository.findBySessionId(data.sessionId);
        if (existing) {
            await studentRepository.updateLastSeen(existing.id);
            return existing;
        }

        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Name is required');
        }

        if (data.name.length > 100) {
            throw new Error('Name is too long (max 100 characters)');
        }

        const student = await studentRepository.create(data);
        return student;
    }

    async getStudentById(id: string): Promise<Student | null> {
        return studentRepository.findById(id);
    }

    async getStudentBySessionId(sessionId: string): Promise<Student | null> {
        return studentRepository.findBySessionId(sessionId);
    }

    async updateLastSeen(id: string): Promise<void> {
        await studentRepository.updateLastSeen(id);
    }

    async getAllStudents(): Promise<Student[]> {
        return studentRepository.findAll();
    }
}

export default new StudentService();
