import mongoose from 'mongoose';

const TestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a test title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a test description'],
    },
    duration: {
      type: Number,
      required: [true, 'Please provide test duration in minutes'],
      min: [10, 'Test duration must be at least 10 minutes'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Please provide total marks'],
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    negativeMarkingValue: {
      type: Number,
      default: 1,
    },
    instructions: String,
  },
  { timestamps: true }
);

export default mongoose.models.Test || mongoose.model('Test', TestSchema);