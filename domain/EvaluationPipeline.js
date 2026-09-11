import { Verdict, VerdictStatus } from './Verdict.js';

// This class is the whole reason the Strategy pattern is worth it here.
// It knows NOTHING about DeterministicEvaluator or LLMEvaluator specifically —
// it just runs whatever Evaluator instances it was given, in order, and merges
// results. Adding a third evaluator later means passing it into the constructor
// array. Nothing in this file changes.

class EvaluationPipeline {
  constructor(evaluators) {
    this.evaluators = evaluators;
  }

  async run(submission, problem) {
    let context = { problem };

    for (const evaluator of this.evaluators) {
      const partial = await evaluator.evaluate(submission, context);
      context = { ...context, ...partial };
    }

    if (!context.deterministicResults || !context.llmResult) {
      throw new Error(
        'EvaluationPipeline expects at least a DeterministicEvaluator and an LLMEvaluator to run'
      );
    }

    const { llmResult, deterministicResults } = context;

    const anyDeterministicFailed = deterministicResults.some((r) => !r.passed);
    const status = anyDeterministicFailed ? VerdictStatus.NEEDS_IMPROVEMENT : llmResult.status;

    return new Verdict({
      status,
      deterministicResults,
      llmReasoning: llmResult.reasoning,
      llmDetails: {
        targetClass: llmResult.targetClass,
        message: llmResult.message,
        followUpQuestion: llmResult.followUpQuestion,
      },
    });
  }
}

export  { EvaluationPipeline };