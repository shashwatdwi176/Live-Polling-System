import { Server, Socket } from 'socket.io';
import pollService from '../services/poll.service';
import voteService from '../services/vote.service';
import studentService from '../services/student.service';
import { CreatePollDTO, SubmitVoteDTO, CreateStudentDTO } from '../types';

export function setupPollSocketHandlers(io: Server, socket: Socket) {
    socket.on('poll:create', async (data: CreatePollDTO) => {
        try {
            const poll = await pollService.createPoll(data);
            socket.emit('poll:created', poll);
        } catch (error: any) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('poll:start', async (pollId: string) => {
        try {
            const poll = await pollService.startPoll(pollId);


            io.emit('poll:started', {
                poll,
                serverTime: new Date().toISOString(),
            });
        } catch (error: any) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('poll:end', async (pollId: string) => {
        try {
            await pollService.endPoll(pollId);


            io.emit('poll:ended', pollId);
        } catch (error: any) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('poll:sync', async (data: { studentId?: string }) => {
        try {
            const state = await pollService.getActivePollWithState(data.studentId);
            socket.emit('poll:state', state);
        } catch (error: any) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('vote:submit', async (data: SubmitVoteDTO) => {
        try {
            await voteService.submitVote(data);


            socket.emit('vote:success');
            const results = await pollService.getPollResults(data.pollId);
            io.emit('poll:vote-update', results);
        } catch (error: any) {
            socket.emit('vote:error', { message: error.message });
        }
    });

    socket.on('student:register', async (data: CreateStudentDTO) => {
        try {
            const student = await studentService.registerStudent(data);
            socket.emit('student:registered', student);
        } catch (error: any) {
            socket.emit('error', { message: error.message });
        }
    });
}
