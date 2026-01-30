import { Request, Response } from 'express';
import pollService from '../services/poll.service';
import { asyncHandler } from '../middleware/error.middleware';
import { CreatePollDTO } from '../types';

class PollController {
    createPoll = asyncHandler(async (req: Request, res: Response) => {
        const data: CreatePollDTO = req.body;
        const poll = await pollService.createPoll(data);
        res.status(201).json(poll);
    });

    startPoll = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const poll = await pollService.startPoll(id);
        res.json(poll);
    });

    endPoll = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const poll = await pollService.endPoll(id);
        res.json(poll);
    });

    getActivePoll = asyncHandler(async (req: Request, res: Response) => {
        const { studentId } = req.query;
        const state = await pollService.getActivePollWithState(
            studentId as string | undefined
        );
        res.json(state);
    });

    getPollById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const poll = await pollService.getPollById(id);
        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }
        res.json(poll);
    });

    getPollResults = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const results = await pollService.getPollResults(id);
        res.json(results);
    });

    getAllPolls = asyncHandler(async (req: Request, res: Response) => {
        const polls = await pollService.getAllPolls();
        res.json(polls);
    });
}

export default new PollController();
