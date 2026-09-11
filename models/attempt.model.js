import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  learnerId: { type: String, default: 'demo-learner' },
  roundCount: { type: Number, default: 0 },
  maxRounds: { type: Number, default: 3 },
  state: { type: String, enum: ['IN_PROGRESS', 'COMPLETED'], default: 'IN_PROGRESS' },
  finalVerdict: {
    summary: { type: String },
    roundsUsed: { type: Number },
  },

}, {timestamps: true});

const Attempt = mongoose.model('Attempt', attemptSchema);
export default Attempt;