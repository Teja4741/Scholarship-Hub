import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database';
import { EmailService } from '../services/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, dateOfBirth, role } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, firstName, lastName, phone, dateOfBirth, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, phone || null, dateOfBirth || null, role || 'student']
    );

    const userId = (result as any).insertId;

    // Generate JWT token
    const token = jwt.sign({ userId, email, role: role || 'student' }, JWT_SECRET, {
      expiresIn: '7d'
    });

    // Send welcome email
    await EmailService.sendWelcomeEmail(email, `${firstName} ${lastName}`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, email, firstName, lastName, role: role || 'student' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, password, role, firstName, lastName, isActive FROM users WHERE email = ?',
      [email]
    );

    const user = (users as any[])[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const [users] = await pool.execute(
      'SELECT id, email, firstName, lastName, phone, dateOfBirth, profileImage, role, createdAt FROM users WHERE id = ?',
      [userId]
    );

    const user = (users as any[])[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { firstName, lastName, phone, dateOfBirth } = req.body;

    await pool.execute(
      'UPDATE users SET firstName = ?, lastName = ?, phone = ?, dateOfBirth = ? WHERE id = ?',
      [firstName, lastName, phone, dateOfBirth, userId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
