import Problem from '../models/problem.model.js';
import Attempt from '../models/attempt.model.js';
import Submission from '../models/submission.model.js';

import { EvaluationPipeline } from '../domain/EvaluationPipeline.js';
import { DeterministicEvaluator } from '../domain/evaluators/DeterministicEvaluator.js';
import { LLMEvaluator } from '../domain/evaluators/LLMEvaluator.js';
import { AttemptOrchestrator } from '../domain/AttemptOrchestrator.js';

// One pipeline instance is enough — evaluators hold no per-request state.
// This is the ONE line you'd touch to add a third evaluator later.
const pipeline = new EvaluationPipeline([new DeterministicEvaluator(), new LLMEvaluator()]);

async function startAttempt(req, res) {
  const { problemId, learnerId } = req.body;
  const problem = await Problem.findById(problemId);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const attempt = await Attempt.create({
    problemId,
    learnerId: learnerId || 'demo-learner',
  });
  res.status(201).json(attempt);
}

async function submitToAttempt(req, res) {
  const { content, respondingTo, type } = req.body;
  const attempt = await Attempt.findById(req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
  if (attempt.state === 'COMPLETED') {
    return res.status(400).json({ error: 'This attempt is already completed.' });
  }

  const problem = await Problem.findById(attempt.problemId);

  const verdict = await pipeline.run({ content }, problem);
  const { outcome, payload, attempt: updatedAttemptData } = AttemptOrchestrator.process(
    attempt.toObject(),
    verdict
  );

  const submission = await Submission.create({
    attemptId: attempt._id,
    content,
    type: type || 'INITIAL',
    respondingTo: respondingTo || null,
    verdictStatus: verdict.status,
    deterministicResults: verdict.deterministicResults,
    llmReasoning: verdict.llmReasoning,
    outcome,
    payload,
  });

  attempt.roundCount = updatedAttemptData.roundCount;
  attempt.state = updatedAttemptData.state;
  if (outcome === 'FINAL_VERDICT') {
    attempt.finalVerdict = payload;
  }
  await attempt.save();

  res.status(201).json({ submission, attempt, outcome, payload });
}

async function getAttempt(req, res) {
  const attempt = await Attempt.findById(req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
  const submissions = await Submission.find({ attemptId: attempt._id }).sort({ createdAt: 1 });
  res.json({ attempt, submissions });
}

async function listHistory(req, res) {
  const filter = req.query.learnerId ? { learnerId: req.query.learnerId } : {};
  const attempts = await Attempt.find(filter).populate('problemId', 'title').sort({ createdAt: -1 });
  res.json(attempts);
}

export { startAttempt, submitToAttempt, getAttempt, listHistory };