import { Request, Response } from 'express';
import studentService from '../services/student.service';
import { asyncHandler } from '../middleware/error.middleware';
import { CreateStudentDTO } from '../types';

class StudentController {
    registerStudent = asyncHandler(async (req: Request, res: Response) => {
        const data: CreateStudentDTO = req.body;
        const student = await studentService.registerStudent(data);
        res.status(201).json(student);
    });

    getBySessionId = asyncHandler(async (req: Request, res: Response) => {
        const { sessionId } = req.params;
        const student = await studentService.getStudentBySessionId(sessionId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    });

    getAllStudents = asyncHandler(async (req: Request, res: Response) => {
        const students = await studentService.getAllStudents();
        res.json(students);
    });
}

export default new StudentController();
