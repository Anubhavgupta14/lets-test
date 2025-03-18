import dbConnect from '@/lib/mongodb';
import Result from '@/models/result';
import jwt, { decode } from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // Extract token from request headers
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const {testId} = req.query;
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let tests = {}
    if(decoded.userId){
        tests = await Result.findOne({test: testId})
    }
    
    return res.status(200).json({
      success: true,
      data: tests
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