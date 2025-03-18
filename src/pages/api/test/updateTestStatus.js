import dbConnect from '@/lib/mongodb';
import Test from '@/models/test';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {

    // Extract testId from query parameters since this is a GET request
    const { testId } = req.body;
    
    if (!testId) {
      return res.status(400).json({ success: false, message: 'Test ID is required' });
    }
    

    // Find the test by ID
    const test = await Test.findById(testId);
    
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    test.isActive = false;
    await test.save();
    
    return res.status(200).json({
      success: true,
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    console.error('Error updating test:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
}