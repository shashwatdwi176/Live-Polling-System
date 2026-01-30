import { Router } from 'express';
import pollController from '../controllers/poll.controller';
import voteController from '../controllers/vote.controller';
import studentController from '../controllers/student.controller';

const router = Router();

router.post('/polls', pollController.createPoll);
router.post('/polls/:id/start', pollController.startPoll);
router.post('/polls/:id/end', pollController.endPoll);
router.get('/polls/active', pollController.getActivePoll);
router.get('/polls/:id', pollController.getPollById);
router.get('/polls/:id/results', pollController.getPollResults);
router.get('/polls', pollController.getAllPolls);

router.post('/votes', voteController.submitVote);
router.get('/votes/check', voteController.checkVoted);

router.post('/students', studentController.registerStudent);
router.get('/students/session/:sessionId', studentController.getBySessionId);
router.get('/students', studentController.getAllStudents);

export default router;
