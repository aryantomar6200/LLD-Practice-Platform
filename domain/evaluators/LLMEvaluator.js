import Evaluator from "../Evaluator.js";
import  callGroq  from '../../utils/groqClient.js';

const SYSTEM_PROMPT = `You are an LLD (Low-Level Design) interviewer evaluating a learner's design submission.
You will be given: a problem description, the learner's submission, and a list of deterministic
structural checks that already ran (pass/fail).

Your job: judge abstraction quality, responsibility boundaries, and extensibility — things a
regex check cannot judge. Then decide if the design is SATISFACTORY or NEEDS_IMPROVEMENT.

Respond ONLY with valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "status": "SATISFACTORY" | "NEEDS_IMPROVEMENT",
  "reasoning": "1-3 sentences on the abstraction quality",
  "targetClass": "the specific class/method this feedback is about, or null",
  "message": "if NEEDS_IMPROVEMENT: specific, actionable feedback pointing at targetClass. if SATISFACTORY: null",
  "followUpQuestion": "if SATISFACTORY: a targeted follow-up question, often a small new requirement to test extensibility. if NEEDS_IMPROVEMENT: null"
}`;

class LLMEvaluator extends Evaluator {
  async evaluate(submission, context) {
    const { problem, deterministicResults } = context;

    const userPrompt = `PROBLEM: ${problem.title}
${problem.description}

DETERMINISTIC CHECKS:
${deterministicResults.map((r) => `- ${r.name}: ${r.passed ? "PASS" : "FAIL"} (${r.message})`).join("\n")}

LEARNER SUBMISSION:
${submission.content}`;

    const raw = await callGroq({ systemPrompt: SYSTEM_PROMPT, userPrompt });

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      parsed = {
        status: "NEEDS_IMPROVEMENT",
        reasoning: "LLM evaluation could not be parsed.",
        targetClass: null,
        message:
          "We could not generate detailed feedback this time — please try submitting again.",
        followUpQuestion: null,
      };
    }

    return { llmResult: parsed };
  }
}

export  { LLMEvaluator };
