import { Request, Response } from 'express';
import voteService from '../services/vote.service';
import { asyncHandler } from '../middleware/error.middleware';
import { SubmitVoteDTO } from '../types';

class VoteController {
    submitVote = asyncHandler(async (req: Request, res: Response) => {
        const data: SubmitVoteDTO = req.body;
        const vote = await voteService.submitVote(data);
        res.status(201).json(vote);
    });

    checkVoted = asyncHandler(async (req: Request, res: Response) => {
        const { pollId, studentId } = req.query;

        if (!pollId || !studentId) {
            return res.status(400).json({ error: 'pollId and studentId required' });
        }

        const hasVoted = await voteService.hasStudentVoted(
            pollId as string,
            studentId as string
        );

        res.json({ hasVoted });
    });
}

export default new VoteController();
