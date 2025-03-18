import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        selectedOption: String, // For MCQ
        numericalValue: Number, // For numerical
        isCorrect: Boolean,
        score: Number, // +4 for correct, -1 for incorrect, 0 for unattempted,
        isMarkedForReview: Boolean
      },
    ],
    totalScore: {
      type: Number,
      default: 0,
    },
    attemptedQuestions: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
    },
    // Subject-wise breakdown
    subjectScores: {
      physics: {
        total: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        incorrect: { type: Number, default: 0 },
        score: { type: Number, default: 0 },
      },
      chemistry: {
        total: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        incorrect: { type: Number, default: 0 },
        score: { type: Number, default: 0 },
      },
      mathematics: {
        total: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        incorrect: { type: Number, default: 0 },
        score: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);


export default mongoose.models.Result || mongoose.model('Result', ResultSchema);