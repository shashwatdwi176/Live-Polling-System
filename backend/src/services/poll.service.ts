import pollRepository from '../repositories/poll.repository';
import voteRepository from '../repositories/vote.repository';
import {
    CreatePollDTO,
    PollWithOptions,
    PollResults,
    PollState,
} from '../types';
import { isPollExpired } from '../utils/timer.utils';

class PollService {
    async createPoll(data: CreatePollDTO): Promise<PollWithOptions> {
        if (!data.question || data.question.trim().length === 0) {
            throw new Error('Question is required');
        }

        if (!data.options || data.options.length < 2) {
            throw new Error('At least 2 options are required');
        }

        if (data.options.length > 10) {
            throw new Error('Maximum 10 options allowed');
        }

        if (data.durationSeconds <= 0 || data.durationSeconds > 60) {
            throw new Error('Duration must be between 1 and 60 seconds');
        }

        const poll = await pollRepository.create(data);
        return poll;
    }

    async startPoll(pollId: string): Promise<PollWithOptions> {
        const activePoll = await pollRepository.findActivePoll();
        if (activePoll && activePoll.id !== pollId) {
            throw new Error('Another poll is already active. End it before starting a new one.');
        }

        const poll = await pollRepository.findById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        if (poll.status !== 'CREATED' && poll.status !== 'ACTIVE') {
            throw new Error('Only polls in CREATED state can be started');
        }

        if (poll.status === 'ACTIVE') {
            return poll;
        }

        const startedAt = new Date();
        const updatedPoll = await pollRepository.updateStatus(
            pollId,
            'ACTIVE',
            startedAt
        );

        return { ...updatedPoll, options: poll.options };
    }

    async endPoll(pollId: string): Promise<PollWithOptions> {
        const poll = await pollRepository.findById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        if (poll.status !== 'ACTIVE') {
            throw new Error('Only active polls can be ended');
        }

        const endedAt = new Date();
        const updatedPoll = await pollRepository.updateStatus(
            pollId,
            'ENDED',
            undefined,
            endedAt
        );

        return { ...updatedPoll, options: poll.options };
    }

    async getActivePoll(): Promise<PollWithOptions | null> {
        const poll = await pollRepository.findActivePoll();

        if (poll && poll.startedAt) {
            if (isPollExpired(poll.startedAt, poll.durationSeconds)) {
                await this.endPoll(poll.id);
                return null;
            }
        }

        return poll;
    }

    async getPollById(pollId: string): Promise<PollWithOptions | null> {
        return pollRepository.findById(pollId);
    }

    async getPollResults(pollId: string): Promise<PollResults> {
        const poll = await pollRepository.findById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        const voteCounts = await voteRepository.getVoteCountsByPollId(pollId);
        const totalVotes = await voteRepository.getTotalVoteCount(pollId);

        const optionResults = poll.options.map((option) => {
            const voteData = voteCounts.find((v) => v.optionId === option.id);
            const count = voteData ? voteData.count : 0;
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;

            return {
                optionId: option.id,
                optionText: option.optionText,
                count,
                percentage: Math.round(percentage * 100) / 100,
            };
        });

        return {
            pollId: poll.id,
            totalVotes,
            options: optionResults,
        };
    }

    async getActivePollWithState(studentId?: string): Promise<PollState> {
        const activePoll = await this.getActivePoll();

        if (!activePoll) {
            return {
                poll: null,
                serverTime: new Date().toISOString(),
                hasVoted: false,
                results: null,
            };
        }

        const hasVoted = studentId
            ? await voteRepository.hasVoted(activePoll.id, studentId)
            : false;

        const results =
            activePoll.status === 'ENDED' || hasVoted
                ? await this.getPollResults(activePoll.id)
                : null;

        return {
            poll: activePoll,
            serverTime: new Date().toISOString(),
            hasVoted,
            results,
        };
    }

    async getAllPolls(): Promise<any[]> {
        return pollRepository.findAll();
    }
}

export default new PollService();
