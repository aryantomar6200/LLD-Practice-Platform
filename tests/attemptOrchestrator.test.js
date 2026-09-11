import test from 'node:test';
import { equal, ok, throws } from 'node:assert/strict';
import { AttemptOrchestrator, OUTCOME } from '../domain/AttemptOrchestrator.js';
import { Verdict, VerdictStatus } from '../domain/Verdict.js';

function baseAttempt(overrides = {}) {
  return { roundCount: 0, maxRounds: 3, state: 'IN_PROGRESS', ...overrides };
}

function satisfactoryVerdict(followUpQuestion = 'What if we add EV charging spots?') {
  return new Verdict({
    status: VerdictStatus.SATISFACTORY,
    deterministicResults: [{ name: 'Vehicle', passed: true, message: 'ok' }],
    llmReasoning: 'Clean separation of concerns.',
    llmDetails: { targetClass: null, message: null, followUpQuestion },
  });
}

function needsImprovementVerdict() {
  return new Verdict({
    status: VerdictStatus.NEEDS_IMPROVEMENT,
    deterministicResults: [{ name: 'PricingStrategy', passed: false, message: 'missing' }],
    llmReasoning: 'Pricing logic is embedded in ParkingSpot.',
    llmDetails: {
      targetClass: 'ParkingSpot',
      message: 'Move fee calculation into a PricingStrategy interface.',
      followUpQuestion: null,
    },
  });
}

test('NEEDS_IMPROVEMENT does not increment roundCount', () => {
  const attempt = baseAttempt({ roundCount: 1 });
  const result = AttemptOrchestrator.process(attempt, needsImprovementVerdict());

  equal(result.outcome, OUTCOME.FEEDBACK);
  equal(result.attempt.roundCount, 1); // unchanged
  equal(result.payload.targetClass, 'ParkingSpot');
});

test('SATISFACTORY increments roundCount and returns FOLLOW_UP when under cap', () => {
  const attempt = baseAttempt({ roundCount: 0 });
  const result = AttemptOrchestrator.process(attempt, satisfactoryVerdict());

  equal(result.outcome, OUTCOME.FOLLOW_UP);
  equal(result.attempt.roundCount, 1);
  ok(result.payload.question);
});

test('reaching maxRounds on a SATISFACTORY verdict produces FINAL_VERDICT', () => {
  const attempt = baseAttempt({ roundCount: 2, maxRounds: 3 });
  const result = AttemptOrchestrator.process(attempt, satisfactoryVerdict());

  equal(result.outcome, OUTCOME.FINAL_VERDICT);
  equal(result.attempt.roundCount, 3);
  equal(result.attempt.state, 'COMPLETED');
});

test('unlimited NEEDS_IMPROVEMENT rounds never trigger FINAL_VERDICT', () => {
  let attempt = baseAttempt({ roundCount: 0 });
  for (let i = 0; i < 10; i++) {
    const result = AttemptOrchestrator.process(attempt, needsImprovementVerdict());
    attempt = result.attempt;
  }
  equal(attempt.roundCount, 0);
  equal(attempt.state, 'IN_PROGRESS');
});

test('Verdict rejects an invalid status (edge case)', () => {
  throws(() => {
    new Verdict({ status: 'MAYBE', deterministicResults: [], llmReasoning: '' });
  }, /Invalid verdict status/);
});