import { Request, Response } from 'express';
import pool from '../database';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.userId);
    if (!req.user || isNaN(userId) || userId <= 0) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const page = Number.isInteger(Number(req.query.page)) ? Number(req.query.page) : 1;
    const limit = Number.isInteger(Number(req.query.limit)) ? Number(req.query.limit) : 20;
    const offset = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

    if (
      !Number.isInteger(page) || page < 1 ||
      !Number.isInteger(limit) || limit < 1 ||
      !Number.isInteger(offset) || offset < 0
    ) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    let query = `
      SELECT id, type, title, message, isRead, data, createdAt
      FROM notifications
      WHERE userId = ?
    `;
    const params: any[] = [userId];

    if (unreadOnly) {
      query += ' AND isRead = FALSE';
    }
    query += ` ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`;

    const [notifications] = await pool.execute(query, params);

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM notifications
      WHERE userId = ?
    `;
    const countParams: any[] = [userId];
    if (unreadOnly) countQuery += ' AND isRead = FALSE';

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = (countResult as any)[0].total;

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark one notification as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.userId);
    if (!req.user || isNaN(userId) || userId <= 0) return res.status(401).json({ error: 'User not authenticated' });

    const notificationIdNum = Number(req.params.notificationId);
    if (isNaN(notificationIdNum) || notificationIdNum <= 0) return res.status(400).json({ error: 'Invalid notification ID' });

    await pool.execute('UPDATE notifications SET isRead = TRUE WHERE id = ? AND userId = ?', [notificationIdNum, userId]);

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.userId);
    if (!req.user || isNaN(userId) || userId <= 0) return res.status(401).json({ error: 'User not authenticated' });

    await pool.execute('UPDATE notifications SET isRead = TRUE WHERE userId = ? AND isRead = FALSE', [userId]);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete a notification
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.userId);
    if (!req.user || isNaN(userId) || userId <= 0) return res.status(401).json({ error: 'User not authenticated' });

    const notificationIdNum = Number(req.params.notificationId);
    if (isNaN(notificationIdNum) || notificationIdNum <= 0) return res.status(400).json({ error: 'Invalid notification ID' });

    await pool.execute('DELETE FROM notifications WHERE id = ? AND userId = ?', [notificationIdNum, userId]);

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Create notification internally
export const createNotification = async (userId: number, type: string, title: string, message: string, data?: any) => {
  try {
    await pool.execute(
      'INSERT INTO notifications (userId, type, title, message, data) VALUES (?, ?, ?, ?, ?)',
      [userId, type, title, message, JSON.stringify(data || {})]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Get unread notifications count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.userId);
    if (!req.user || isNaN(userId) || userId <= 0) return res.status(401).json({ error: 'User not authenticated' });

    const [result] = await pool.execute('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = FALSE', [userId]);

    res.json({ count: (result as any)[0].count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};