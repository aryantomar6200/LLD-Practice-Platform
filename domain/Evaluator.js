class Evaluator {
  async evaluate(submission, context) {
    throw new Error(
      `${this.constructor.name} must implement evaluate(submission, context)`
    );
  }
}

export default  Evaluator ;