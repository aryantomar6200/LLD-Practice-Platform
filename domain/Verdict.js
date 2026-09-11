// A Verdict is what the EvaluationPipeline produces after checking a submission.
// It does NOT decide what happens next (feedback vs follow-up vs final verdict) —
// that decision belongs to AttemptOrchestrator. Keeping Verdict "dumb" (just data +
// status) is deliberate: it stops this class from growing into something that
// does too many jobs at once.

const VerdictStatus = Object.freeze({
  SATISFACTORY: 'SATISFACTORY',
  NEEDS_IMPROVEMENT: 'NEEDS_IMPROVEMENT',
});

class Verdict {
  /**
   * @param {string} status - one of VerdictStatus
   * @param {Array<{name: string, passed: boolean, message: string}>} deterministicResults
   * @param {string} llmReasoning - free-text explanation from the LLM evaluator
   * @param {object} llmDetails - { targetClass, message, followUpQuestion }
   */
  constructor({ status, deterministicResults, llmReasoning, llmDetails }) {
    if (!Object.values(VerdictStatus).includes(status)) {
      throw new Error(`Invalid verdict status: ${status}`);
    }
    this.status = status;
    this.deterministicResults = deterministicResults;
    this.llmReasoning = llmReasoning;
    this.llmDetails = llmDetails || {};
  }

  isSatisfactory() {
    return this.status === VerdictStatus.SATISFACTORY;
  } 
}

export { Verdict, VerdictStatus };