import Evaluator from "../Evaluator.js";

// Checks things that don't need "judgment" — a class either exists or it doesn't.
// Each Problem defines requiredConcepts, e.g. for Parking Lot:
//   [{ name: 'Vehicle', hint: '...' }, { name: 'ParkingSpot', hint: '...' }]
//
// This uses a regex over the submitted text rather than a real parser/AST —
// a deliberate MVP trade-off: good enough to prove the deterministic-vs-LLM
// split, not a full static analysis engine.

class DeterministicEvaluator extends Evaluator {
  async evaluate(submission, context) {
    const { problem } = context;
    const content = submission.content || "";

    const results = problem.requiredConcepts.map((concept) => {
      const pattern = concept.pattern || new RegExp(`(class|interface)\\s+\\w*${concept.name}\\w*`, "i");
      const passed = pattern.test(content);
      return {
        name: concept.name,
        passed,
        message: passed
          ? `Found expected concept: ${concept.name}`
          : `Missing expected concept: ${concept.name} (${concept.hint || "no hint provided"})`,
      };
    });

    return { deterministicResults: results };
  }
}

export { DeterministicEvaluator };
