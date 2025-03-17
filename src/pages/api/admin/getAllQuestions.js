import dbConnect from '@/lib/mongodb';
import Test from '@/models/test';
import Question from '@/models/question';

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
    
    const questions = await Question.find({});
    
    return res.status(200).json({
      success: true,
      data: questions,
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    console.error('Error fetching tests:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
}