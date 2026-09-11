import Problem from '../models/problem.model.js';

async function listProblems(req, res) {
  const problems = await Problem.find({}, 'title description difficulty tags');
  res.json(problems);
}

async function getProblem(req, res) {
  const problem = await Problem.findById(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });
  res.json(problem);
}

export { listProblems, getProblem };