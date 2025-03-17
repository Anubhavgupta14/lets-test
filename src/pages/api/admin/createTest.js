import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import Test from '@/models/test';
import Question from '@/models/question';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // Extract token from request headers
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
    }
    
    // Get test data from request body
    const {
      title,
      description,
      duration,
      totalMarks,
      questions,
      isActive,
      startDate,
      endDate,
      negativeMarkingValue,
      instructions
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !duration || !totalMarks || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, duration, totalMarks, and questions array'
      });
    }
    
    // Validate that questions exist
    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Test must include at least one question'
      });
    }
    
    // Verify all question IDs are valid
    const questionIds = questions.map(q => q.toString());
    const existingQuestions = await Question.find({ _id: { $in: questionIds } });
    
    if (existingQuestions.length !== questionIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more question IDs are invalid'
      });
    }
    
    // Validate dates
    if (endDate && new Date(endDate) <= new Date(startDate || Date.now())) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }
    
    // Create test
    const newTest = await Test.create({
      title,
      description,
      duration,
      totalMarks,
      questions: questionIds,
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate || Date.now(),
      endDate: endDate || null,
      negativeMarkingValue: negativeMarkingValue || 1,
      instructions: instructions || ''
    });
    
    // Return newly created test with populated questions
    const populatedTest = await Test.findById(newTest._id).populate('questions');
    
    return res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: populatedTest
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: validationErrors.join(', ') 
      });
    }
    
    console.error('Error creating test:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
}