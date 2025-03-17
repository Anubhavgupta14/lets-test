import dbConnect from '@/lib/mongodb';
import Test from '@/models/test';
import Question from '@/models/question';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // Extract token from request headers
    const token = req.headers.authorization?.split(' ')[1];

    const {id} = req.query;
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    // Find the test by ID
    const test = await Test.findById(id);
    
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Get the question IDs from the test
    const questionIds = test.questions;
    
    // Fetch all question documents that match the IDs in the test
    const questionsData = await Question.find({
      _id: { $in: questionIds }
    });
    
    // Return both the test and the questions data
    return res.status(200).json({
      success: true,
      data: questionsData
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    console.error('Error fetching test and questions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
}