import mongoose from 'mongoose';
import Result from '@/models/result';

const updateSubjectScores = async (resultId) => {
  const result = await Result.findById(resultId).populate({
    path: 'answers.question',
    select: 'subject options questionType'
  });
  
  if (!result) return null;
  
  // Reset subject scores
  const subjectScores = {
    physics: { total: 0, correct: 0, incorrect: 0, score: 0 },
    chemistry: { total: 0, correct: 0, incorrect: 0, score: 0 },
    mathematics: { total: 0, correct: 0, incorrect: 0, score: 0 }
  };
  
  // Recalculate subject scores based on answers
  result.answers.forEach(answer => {
    if (answer.question && answer.question.subject) {
      const subject = answer.question.subject.toLowerCase();
      if (subjectScores[subject]) {
        subjectScores[subject].total += 1;
        
        if (answer.isCorrect === true) {
          subjectScores[subject].correct += 1;
          subjectScores[subject].score += 4;
        } else if (answer.isCorrect === false) {
          subjectScores[subject].incorrect += 1;
          subjectScores[subject].score -= 1;
        }
      }
    }
  });
  
  result.subjectScores = subjectScores;
  
  result.totalScore = 
    subjectScores.physics.score + 
    subjectScores.chemistry.score + 
    subjectScores.mathematics.score;
  
  result.correctAnswers = 
    subjectScores.physics.correct + 
    subjectScores.chemistry.correct + 
    subjectScores.mathematics.correct;
  
  result.incorrectAnswers = 
    subjectScores.physics.incorrect + 
    subjectScores.chemistry.incorrect + 
    subjectScores.mathematics.incorrect;
  
  result.attemptedQuestions = result.correctAnswers + result.incorrectAnswers;
  
  await result.save();
  return result;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { userId, testId, questionId, selectedOption, numericalValue, isMarkedForReview, action } = req.body;
    
    if (!questionId || !action) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate if questionId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: 'Invalid question ID format' });
    }
    
    // Find or create result document
    let result;
    
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      // Try to find existing result
      result = await Result.findOne({user: userId});
    }
    
    if (!result) {

      console.log("coming")
      // We need to create a new result
      if (!userId || !testId || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ message: 'To create a new result, valid userId and testId are required' });
      }
      
      // Create a new result
      result = await Result.create({
        user: userId,
        test: testId,
        startTime: new Date(),
        answers: []
      });
    }
    
    // Get question from database to check correct answer
    const Question = mongoose.model('Question');
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    console.log(result,"result")
    
    // Check if the question already exists in answers array
    const existingAnswerIndex = result.answers.findIndex(
      answer => answer.question.toString() === questionId
    );
    
    // Determine if the answer is correct
    let isCorrect = null;
    let score = 0;
    
    if (question.questionType === 'MCQ' && selectedOption) {
      // Find the correct option
      const correctOption = question.options.find(option => option.isCorrect);
      const selectedOptionObj = question.options.find(option => option._id.toString() === selectedOption || option.text === selectedOption);
      
      if (correctOption && selectedOptionObj) {
        isCorrect = selectedOptionObj.isCorrect;
        score = isCorrect ? 4 : -1;
      }
    } else if (question.questionType === 'Numerical' && numericalValue !== undefined) {
      console.log("Numerical")
      // For numerical questions, check if there's a correctNumericalValue
      if (question.numericalAnswer !== undefined) {
        isCorrect = numericalValue == question.numericalAnswer;
        score = isCorrect ? 4 : -1;
      }
    }
    
    // Update or add the answer
    if (existingAnswerIndex !== -1) {
      // Update existing answer
      console.log("running")
      result.answers[existingAnswerIndex] = {
        ...result.answers[existingAnswerIndex],
        question: result.answers[existingAnswerIndex].question,
        selectedOption: selectedOption || result.answers[existingAnswerIndex].selectedOption,
        numericalValue: numericalValue !== undefined ? numericalValue : result.answers[existingAnswerIndex].numericalValue,
        isCorrect: (selectedOption || numericalValue !== undefined) ? isCorrect : result.answers[existingAnswerIndex].isCorrect,
        score: (selectedOption || numericalValue !== undefined) ? score : result.answers[existingAnswerIndex].score,
        isMarkedForReview: isMarkedForReview !== undefined ? isMarkedForReview : result.answers[existingAnswerIndex].isMarkedForReview
      };
    } else {
      // Add new answer
      result.answers.push({
        question: questionId,
        selectedOption,
        numericalValue,
        isCorrect,
        score,
        isMarkedForReview: isMarkedForReview || false
      });
    }
    
    // Save the result
    await result.save();
    
    // Update subject scores and totals
    result = await updateSubjectScores(result._id);
    
    return res.status(200).json({
      success: true,
      message: `Answer ${action === 'saveAndNext' ? 'saved' : 'marked for review'}`,
      resultId: result._id, // Return the resultId for future requests
      data: result
    });
    
  } catch (error) {
    console.error('Error saving answer:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}