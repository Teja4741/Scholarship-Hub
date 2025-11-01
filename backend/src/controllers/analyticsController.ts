import { Request, Response } from 'express';
import pool from '../database';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get total counts
    const [scholarshipCount] = await pool.execute('SELECT COUNT(*) as count FROM scholarships WHERE isActive = TRUE');
    const [applicationCount] = await pool.execute('SELECT COUNT(*) as count FROM applications');
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "student"');
    const [documentCount] = await pool.execute('SELECT COUNT(*) as count FROM documents');

    // Get application status breakdown
    const [statusStats] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM applications
      GROUP BY status
    `);

    // Get monthly application trends (last 12 months)
    const [monthlyStats] = await pool.execute(`
      SELECT
        DATE_FORMAT(submittedAt, '%Y-%m') as month,
        COUNT(*) as applications
      FROM applications
      WHERE submittedAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(submittedAt, '%Y-%m')
      ORDER BY month
    `);

    // Get scholarship type distribution
    const [scholarshipTypes] = await pool.execute(`
      SELECT type, COUNT(*) as count
      FROM scholarships
      WHERE isActive = TRUE
      GROUP BY type
    `);

    // Get recent applications
    const [recentApplications] = await pool.execute(`
      SELECT a.id, a.studentName, a.status, a.submittedAt, s.name as scholarshipName
      FROM applications a
      JOIN scholarships s ON a.scholarshipId = s.id
      ORDER BY a.submittedAt DESC
      LIMIT 10
    `);

    // Get top performing scholarships
    const [topScholarships] = await pool.execute(`
      SELECT s.name, COUNT(a.id) as applicationCount
      FROM scholarships s
      LEFT JOIN applications a ON s.id = a.scholarshipId
      WHERE s.isActive = TRUE
      GROUP BY s.id, s.name
      ORDER BY applicationCount DESC
      LIMIT 5
    `);

    res.json({
      totalStats: {
        scholarships: (scholarshipCount as any[])[0].count,
        applications: (applicationCount as any[])[0].count,
        users: (userCount as any[])[0].count,
        documents: (documentCount as any[])[0].count
      },
      statusBreakdown: statusStats,
      monthlyTrends: monthlyStats,
      scholarshipTypes: scholarshipTypes,
      recentApplications: recentApplications,
      topScholarships: topScholarships
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // User registration trends
    const [userTrends] = await pool.execute(`
      SELECT
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as registrations
      FROM users
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month
    `);

    // User activity metrics
    const [userActivity] = await pool.execute(`
      SELECT
        u.id,
        u.firstName,
        u.lastName,
        u.email,
        COUNT(DISTINCT a.id) as applicationsSubmitted,
        COUNT(DISTINCT uss.scholarshipId) as scholarshipsSaved,
        COUNT(DISTINCT n.id) as notificationsReceived,
        u.createdAt as joinedDate
      FROM users u
      LEFT JOIN applications a ON u.id = a.userId
      LEFT JOIN user_saved_scholarships uss ON u.id = uss.userId
      LEFT JOIN notifications n ON u.id = n.userId
      WHERE u.role = 'student'
      GROUP BY u.id, u.firstName, u.lastName, u.email, u.createdAt
      ORDER BY applicationsSubmitted DESC
      LIMIT 20
    `);

    res.json({
      userTrends: userTrends,
      userActivity: userActivity
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getScholarshipAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Scholarship performance metrics
    const [scholarshipPerformance] = await pool.execute(`
      SELECT
        s.id,
        s.name,
        s.type,
        s.amount,
        s.deadline,
        COUNT(a.id) as totalApplications,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approvedApplications,
        COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejectedApplications,
        COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pendingApplications,
        AVG(a.marks) as averageMarks,
        AVG(a.familyIncome) as averageIncome
      FROM scholarships s
      LEFT JOIN applications a ON s.id = a.scholarshipId
      WHERE s.isActive = TRUE
      GROUP BY s.id, s.name, s.type, s.amount, s.deadline
      ORDER BY totalApplications DESC
    `);

    // Application approval rates by scholarship type
    const [approvalRates] = await pool.execute(`
      SELECT
        s.type,
        COUNT(a.id) as totalApplications,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approvedCount,
        ROUND((COUNT(CASE WHEN a.status = 'approved' THEN 1 END) / COUNT(a.id)) * 100, 2) as approvalRate
      FROM scholarships s
      LEFT JOIN applications a ON s.id = a.scholarshipId
      WHERE s.isActive = TRUE
      GROUP BY s.type
      ORDER BY approvalRate DESC
    `);

    res.json({
      scholarshipPerformance: scholarshipPerformance,
      approvalRates: approvalRates
    });
  } catch (error) {
    console.error('Error fetching scholarship analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const exportData = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const { type } = req.query;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'applications':
        const [applications] = await pool.execute(`
          SELECT a.*, s.name as scholarshipName, u.email as userEmail
          FROM applications a
          JOIN scholarships s ON a.scholarshipId = s.id
          LEFT JOIN users u ON a.userId = u.id
          ORDER BY a.submittedAt DESC
        `);
        data = applications as any[];
        filename = 'applications_export.csv';
        break;

      case 'users':
        const [users] = await pool.execute(`
          SELECT id, email, firstName, lastName, phone, role, isActive, emailVerified, createdAt
          FROM users
          ORDER BY createdAt DESC
        `);
        data = users as any[];
        filename = 'users_export.csv';
        break;

      case 'scholarships':
        const [scholarships] = await pool.execute(`
          SELECT * FROM scholarships WHERE isActive = TRUE ORDER BY createdAt DESC
        `);
        data = scholarships as any[];
        filename = 'scholarships_export.csv';
        break;

      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    // Convert to CSV
    if (data.length > 0) {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row =>
        Object.values(row).map(value =>
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      );
      const csv = [headers, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } else {
      res.status(404).json({ error: 'No data found' });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
