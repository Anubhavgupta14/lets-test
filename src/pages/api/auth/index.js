import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'POST':
      try {
        const { action, email, password, name } = req.body;

        if (action === 'signup') {
          // Check if user exists
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
          }

          // Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          // Create new user
          const user = await User.create({
            name,
            email,
            password: hashedPassword
          });

          // Generate token
          const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          return res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email }
          });

        } else if (action === 'login') {
          // Find user
          const user = await User.findOne({ email });
          if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
          }

          // Verify password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
          }

          // Generate token
          const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          return res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email }
          });
        }
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}