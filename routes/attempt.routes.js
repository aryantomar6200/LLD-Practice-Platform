import express from 'express';
import {
  startAttempt,
  submitToAttempt,
  getAttempt,
  listHistory,
} from '../controllers/attempt.controllers.js';

const router = express.Router();

router.post('/', startAttempt); // { problemId, learnerId? }
router.get('/', listHistory); // ?learnerId=
router.get('/:attemptId', getAttempt);
router.post('/:attemptId/submissions', submitToAttempt); // { content, respondingTo?, type? }

export default router;