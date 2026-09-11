import test from 'node:test';
import assert from 'node:assert/strict';
import Evaluator  from '../domain/Evaluator.js';
import { DeterministicEvaluator } from '../domain/evaluators/DeterministicEvaluator.js';
import { EvaluationPipeline } from '../domain/EvaluationPipeline.js';
import { VerdictStatus } from '../domain/Verdict.js';

// A fake LLM evaluator so this test never makes a real network call.
// Only possible because both this and the real LLMEvaluator implement
// the same Evaluator interface — the pipeline can't tell the difference.
class FakeSatisfactoryLLMEvaluator extends Evaluator {
  async evaluate() {
    return {
      llmResult: {
        status: 'SATISFACTORY',
        reasoning: 'Good separation of concerns.',
        targetClass: null,
        message: null,
        followUpQuestion: 'What changes if we add hourly AND subscription pricing?',
      },
    };
  }
}

const parkingLotProblem = {
  title: 'Parking Lot',
  description: 'Design a parking lot system.',
  requiredConcepts: [
    { name: 'Vehicle', hint: 'a Vehicle abstraction' },
    { name: 'ParkingSpot', hint: 'a ParkingSpot class' },
  ],
};

test('DeterministicEvaluator flags a missing required concept', async () => {
  const evaluator = new DeterministicEvaluator();
  const submission = { content: 'class Vehicle {}' }; // ParkingSpot missing

  const { deterministicResults } = await evaluator.evaluate(submission, {
    problem: parkingLotProblem,
  });

  const vehicleCheck = deterministicResults.find((r) => r.name === 'Vehicle');
  const spotCheck = deterministicResults.find((r) => r.name === 'ParkingSpot');

  assert.equal(vehicleCheck.passed, true);
  assert.equal(spotCheck.passed, false);
});

test('EvaluationPipeline: deterministic failure overrides an LLM SATISFACTORY result', async () => {
  const pipeline = new EvaluationPipeline([
    new DeterministicEvaluator(),
    new FakeSatisfactoryLLMEvaluator(),
  ]);

  const submission = { content: 'class Vehicle {}' }; // still missing ParkingSpot
  const verdict = await pipeline.run(submission, parkingLotProblem);

  assert.equal(verdict.status, VerdictStatus.NEEDS_IMPROVEMENT);
});

test('EvaluationPipeline: all checks passing + LLM SATISFACTORY yields SATISFACTORY', async () => {
  const pipeline = new EvaluationPipeline([
    new DeterministicEvaluator(),
    new FakeSatisfactoryLLMEvaluator(),
  ]);

  const submission = { content: 'class Vehicle {}\nclass ParkingSpot {}' };
  const verdict = await pipeline.run(submission, parkingLotProblem);

  assert.equal(verdict.status, VerdictStatus.SATISFACTORY);
  assert.ok(verdict.llmDetails.followUpQuestion);
});