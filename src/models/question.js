import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Please provide question text'],
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      enum: ['Physics', 'Chemistry', 'Mathematics'],
    },
    questionType: {
      type: String,
      enum: ['MCQ', 'Numerical'],
      default: 'MCQ',
    },
    options: {
      type: [
        {
          text: String,
          isCorrect: Boolean,
        },
      ],
    },
    numericalAnswer: {
      type: Number
    },
    images: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);