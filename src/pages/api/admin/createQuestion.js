import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import Question from '@/models/question';
import jwt from 'jsonwebtoken';
import cloudinary from 'cloudinary';
import { IncomingForm } from 'formidable';
import fs from 'fs';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Parse form data
const parseForm = async (req) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      multiples: true,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

// Upload file to Cloudinary
const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      file.filepath,
      { folder: 'question-images' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
  });
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // Parse the form data
    const { fields, files } = await parseForm(req);
    
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
    
    // Parse question data - ENSURE THE DATA IS BEING PARSED CORRECTLY
    let questionData;
    try {
      // Debug the received data
      console.log("Received data field:", fields.data);
      
      // Make sure we're parsing the data field correctly
      questionData = fields.data ? JSON.parse(fields.data) : {};
      
      // Log the parsed data to ensure it's correct
      console.log("Parsed question data:", questionData);
      
      if (!questionData.question || !questionData.subject) {
        return res.status(400).json({
          success: false,
          message: "Required fields missing. Check that question and subject are provided."
        });
      }
    } catch (parseError) {
      console.error("Error parsing question data:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid question data format. Please provide valid JSON.",
        error: parseError.message
      });
    }
    
    // Process uploaded files if any
    const imageUrls = [];
    if (files.images) {
      // Handle multiple images
      const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
      
      for (const file of imageFiles) {
        const imageUrl = await uploadToCloudinary(file);
        imageUrls.push(imageUrl);
        
        // Clean up temp file
        fs.unlinkSync(file.filepath);
      }
    }
    
    if (imageUrls.length > 0) {
      questionData.images = imageUrls;
    }
    
    // Validate question data more explicitly before sending to mongoose
    if (!questionData.question || questionData.question.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide question text' 
      });
    }
    
    if (!questionData.subject || !['Physics', 'Chemistry', 'Mathematics'].includes(questionData.subject)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid subject (Physics, Chemistry, or Mathematics)' 
      });
    }
    
    if (questionData.questionType === 'Numerical') {
      if (!questionData.numericalAnswer) {
        return res.status(400).json({ 
          success: false, 
          message: 'Numerical answer value is required for numerical questions' 
        });
      }
    } else if (questionData.questionType === 'MCQ') {
      if (!questionData.options || !Array.isArray(questionData.options) || questionData.options.length !== 4) {
        return res.status(400).json({ 
          success: false, 
          message: 'Exactly 4 options are required for MCQ questions' 
        });
      }
      
      // Ensure at least one option is marked as correct
      const hasCorrectOption = questionData.options.some(option => option.isCorrect);
      if (!hasCorrectOption) {
        return res.status(400).json({ 
          success: false, 
          message: 'At least one option must be marked as correct' 
        });
      }
    }
    
    // Create the question
    const newQuestion = await Question.create(questionData);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Question created successfully',
      data: newQuestion 
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    if (error.name === 'ValidationError') {
      // More detailed validation error handling
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: validationErrors.join(', '),
        details: error.errors 
      });
    }
    
    console.error('Error creating question:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
}