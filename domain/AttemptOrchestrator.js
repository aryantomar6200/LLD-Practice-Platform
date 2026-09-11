import { VerdictStatus } from './Verdict.js';

// This is the "what happens next" logic — separated from Verdict on purpose.
// Verdict answers "was this submission good?". AttemptOrchestrator answers
// "given that answer, and how far into the attempt we are, what does the
// learner see next?".

const OUTCOME = Object.freeze({
  FEEDBACK: 'FEEDBACK',
  FOLLOW_UP: 'FOLLOW_UP',
  FINAL_VERDICT: 'FINAL_VERDICT',
});

class AttemptOrchestrator {
  static process(attempt, verdict) {
    if (verdict.status === VerdictStatus.NEEDS_IMPROVEMENT) {
      return {
        outcome: OUTCOME.FEEDBACK,
        payload: {
          targetClass: verdict.llmDetails.targetClass,
          message: verdict.llmDetails.message,
          deterministicResults: verdict.deterministicResults,
        },
        attempt, // unchanged — round doesn't count
      };
    }

    // SATISFACTORY — this round counts
    const updatedAttempt = {
      ...attempt,
      roundCount: attempt.roundCount + 1,
    };

    if (updatedAttempt.roundCount >= updatedAttempt.maxRounds) {
      updatedAttempt.state = 'COMPLETED';
      return {
        outcome: OUTCOME.FINAL_VERDICT,
        payload: {
          summary: verdict.llmReasoning,
          roundsUsed: updatedAttempt.roundCount,
        },
        attempt: updatedAttempt,
      };
    }

    return {
      outcome: OUTCOME.FOLLOW_UP,
      payload: { question: verdict.llmDetails.followUpQuestion },
      attempt: updatedAttempt,
    };
  }
}

export { AttemptOrchestrator, OUTCOME };