import voteRepository from '../repositories/vote.repository';
import pollRepository from '../repositories/poll.repository';
import studentRepository from '../repositories/student.repository';
import { SubmitVoteDTO, Vote } from '../types';
import { isPollExpired } from '../utils/timer.utils';

class VoteService {
    async submitVote(data: SubmitVoteDTO): Promise<Vote> {
        const poll = await pollRepository.findById(data.pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        if (poll.status !== 'ACTIVE') {
            throw new Error('Poll is not active');
        }

        if (poll.startedAt && isPollExpired(poll.startedAt, poll.durationSeconds)) {
            throw new Error('Poll has expired');
        }

        const student = await studentRepository.findById(data.studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        const validOption = poll.options.find((opt) => opt.id === data.optionId);
        if (!validOption) {
            throw new Error('Invalid option for this poll');
        }

        const hasVoted = await voteRepository.hasVoted(data.pollId, data.studentId);
        if (hasVoted) {
            throw new Error('You have already voted on this poll');
        }

        try {
            const vote = await voteRepository.create(data);
            return vote;
        } catch (error: any) {
            if (error.message.includes('already voted')) {
                throw error;
            }
            throw new Error('Failed to submit vote: ' + error.message);
        }
    }

    async hasStudentVoted(pollId: string, studentId: string): Promise<boolean> {
        return voteRepository.hasVoted(pollId, studentId);
    }

    async getVotesForPoll(pollId: string): Promise<Vote[]> {
        return voteRepository.getVotesByPollId(pollId);
    }
}

export default new VoteService();
