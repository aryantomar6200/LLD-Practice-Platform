import mongoose from 'mongoose';

const checkResultSchema = new mongoose.Schema(
  { name: String, passed: Boolean, message: String },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', required: true },
    content: { type: String, required: true }, // learner's code/pseudocode
    type: { type: String, enum: ['INITIAL', 'REVISION'], default: 'INITIAL' },
    respondingTo: { type: String, default: null },

    // --- filled in after EvaluationPipeline + AttemptOrchestrator run ---
    verdictStatus: { type: String, enum: ['SATISFACTORY', 'NEEDS_IMPROVEMENT'] },
    deterministicResults: [checkResultSchema],
    llmReasoning: { type: String },
    outcome: { type: String, enum: ['FEEDBACK', 'FOLLOW_UP', 'FINAL_VERDICT'] },
    payload: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model('Submission', submissionSchema);