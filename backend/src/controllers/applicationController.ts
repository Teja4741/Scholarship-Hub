import { Request, Response } from 'express';
import pool from '../database';
import { Application } from '../types';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';
import { EmailService } from '../services/emailService';
import { FileUploadService } from '../services/fileUploadService';



// Get all applications for current user or all (if admin)
export const getAllApplications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.userId);
    if (!req.user || isNaN(userId) || userId <= 0) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userRole = req.user?.role;
    let query = `
      SELECT a.*, s.name as scholarshipName
      FROM applications a
      JOIN scholarships s ON a.scholarshipId = s.id
    `;
    let params: any[] = [];

    if (userRole !== 'admin') {
      query += ' WHERE a.userId = ?';
      params.push(userId);
    }
    query += ' ORDER BY a.submittedAt DESC';

    const [rows] = await pool.execute(query, params);
    const applications: (Application & { scholarshipName: string })[] = (rows as any[]).map(row => ({
      id: row.id,
      scholarshipId: row.scholarshipId,
      userId: row.userId,
      studentName: row.studentName,
      email: row.email,
      phone: row.phone,
      dateOfBirth: row.dateOfBirth,
      address: row.address,
      nationality: row.nationality,
      category: row.category,
      marks: row.marks,
      gpa: row.gpa,
      familyIncome: row.familyIncome,
      course: row.course,
      degree: row.degree,
      yearOfStudy: row.yearOfStudy,
      fieldOfStudy: row.fieldOfStudy,
      graduationDate: row.graduationDate,
      institution: row.institution,
      submittedAt: row.submittedAt,
      status: row.status,
      reviewedAt: row.reviewedAt,
      reviewerNotes: row.reviewerNotes,
      installmentPlan: row.installmentPlan,
      installmentAmount: row.installmentAmount,
      installmentDuration: row.installmentDuration,
      scholarshipName: row.scholarshipName,
      scholarshipAmount: row.scholarshipAmount
    }));
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get application by ID for the user or admin
export const getApplicationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(req.user?.userId);
    if (!req.user || isNaN(userId) || userId <= 0) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userRole = req.user?.role;
    let query = `
      SELECT a.*, s.name as scholarshipName
      FROM applications a
      JOIN scholarships s ON a.scholarshipId = s.id
      WHERE a.id = ?
    `;
    let params: any[] = [id];

    if (userRole !== 'admin') {
      query += ' AND a.userId = ?';
      params.push(userId);
    }

    const [rows] = await pool.execute(query, params);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const row = (rows as any[])[0];
    const application: Application & { scholarshipName: string } = {
      id: row.id,
      scholarshipId: row.scholarshipId,
      userId: row.userId,
      studentName: row.studentName,
      email: row.email,
      phone: row.phone,
      dateOfBirth: row.dateOfBirth,
      address: row.address,
      nationality: row.nationality,
      category: row.category,
      marks: row.marks,
      gpa: row.gpa,
      familyIncome: row.familyIncome,
      course: row.course,
      degree: row.degree,
      yearOfStudy: row.yearOfStudy,
      fieldOfStudy: row.fieldOfStudy,
      graduationDate: row.graduationDate,
      institution: row.institution,
      submittedAt: row.submittedAt,
      status: row.status,
      reviewedAt: row.reviewedAt,
      reviewerNotes: row.reviewerNotes,
      installmentPlan: row.installmentPlan,
      installmentAmount: row.installmentAmount,
      installmentDuration: row.installmentDuration,
      scholarshipName: row.scholarshipName,
      scholarshipAmount: row.scholarshipAmount
    };
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new application
export const createApplication = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.userId);
    if (!req.user || isNaN(userId) || userId <= 0) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Extract form data from JSON request body
    const applicationData = req.body;

    // Validate required fields
    const requiredFields = ['scholarshipId', 'studentName', 'email', 'phone', 'dateOfBirth', 'category', 'marks', 'familyIncome', 'course', 'institution'];
    for (const field of requiredFields) {
      if (!applicationData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Insert application into database
    const [result] = await pool.execute(
      'INSERT INTO applications (userId, scholarshipId, studentName, email, phone, dateOfBirth, address, nationality, category, marks, gpa, familyIncome, course, degree, yearOfStudy, fieldOfStudy, graduationDate, institution) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, applicationData.scholarshipId, applicationData.studentName, applicationData.email, applicationData.phone, applicationData.dateOfBirth, applicationData.address, applicationData.nationality, applicationData.category, applicationData.marks, applicationData.gpa, applicationData.familyIncome, applicationData.course, applicationData.degree, applicationData.yearOfStudy, applicationData.fieldOfStudy, applicationData.graduationDate, applicationData.institution]
    );
    const applicationId = (result as any).insertId;

    res.status(201).json({ id: applicationId, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update application status by admin
export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewerNotes, installmentPlan, installmentAmount, installmentDuration, scholarshipAmount } = req.body;
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [applicationRows] = await pool.execute(
      'SELECT a.userId, a.studentName, a.email, s.name as scholarshipName FROM applications a JOIN scholarships s ON a.scholarshipId = s.id WHERE a.id = ?',
      [id]
    );

    if ((applicationRows as any[]).length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = (applicationRows as any[])[0];

    // Build dynamic update query based on provided fields
    let updateFields = ['status = ?'];
    let params = [status];

    if (reviewerNotes !== undefined) {
      updateFields.push('reviewerNotes = ?');
      params.push(reviewerNotes);
    }

    if (installmentPlan !== undefined) {
      updateFields.push('installmentPlan = ?');
      params.push(installmentPlan);
    }

    if (installmentAmount !== undefined) {
      updateFields.push('installmentAmount = ?');
      params.push(installmentAmount);
    }

    if (installmentDuration !== undefined) {
      updateFields.push('installmentDuration = ?');
      params.push(installmentDuration);
    }

    if (scholarshipAmount !== undefined) {
      updateFields.push('scholarshipAmount = ?');
      params.push(scholarshipAmount);
    }

    updateFields.push('reviewedAt = NOW()');
    params.push(id);

    const query = `UPDATE applications SET ${updateFields.join(', ')} WHERE id = ?`;

    await pool.execute(query, params);

    await NotificationService.sendApplicationStatusUpdate(application.userId, parseInt(id), status);

    await EmailService.sendApplicationStatusEmail(application.email, application.studentName, application.scholarshipName, status);

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete application by admin
export const deleteApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
        const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await pool.execute('DELETE FROM applications WHERE id = ?', [id]);
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
