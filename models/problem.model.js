import mongoose from 'mongoose';

const requiredConceptSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Vehicle"
    hint: { type: String, required: true }, // shown to learner if missing
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
  tags: [{ type: String }],
  requiredConcepts: [requiredConceptSchema],
  
}, {timestamps: true});

export default mongoose.model('Problem', problemSchema);    