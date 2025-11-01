import { createNotification } from '../controllers/notificationController';
import pool from '../database';

export class NotificationService {
  static async sendApplicationStatusUpdate(userId: number, applicationId: number, status: string) {
    const title = 'Application Status Update';
    const message = `Your scholarship application status has been updated to: ${status}`;

    await createNotification(userId, 'application_status', title, message, {
      applicationId,
      status
    });
  }

  static async sendDeadlineReminder(userId: number, scholarshipId: number, scholarshipName: string, daysLeft: number) {
    const title = 'Scholarship Deadline Reminder';
    const message = `The deadline for "${scholarshipName}" is approaching in ${daysLeft} days. Don't miss out!`;

    await createNotification(userId, 'deadline_reminder', title, message, {
      scholarshipId,
      daysLeft
    });
  }

  static async sendNewScholarshipAlert(userId: number, scholarshipId: number, scholarshipName: string) {
    const title = 'New Scholarship Available';
    const message = `A new scholarship "${scholarshipName}" has been added that may interest you.`;

    await createNotification(userId, 'new_scholarship', title, message, {
      scholarshipId
    });
  }

  static async sendSystemNotification(userId: number, title: string, message: string, data?: any) {
    await createNotification(userId, 'system', title, message, data);
  }

  static async sendBulkNotifications(userIds: number[], type: string, title: string, message: string, data?: any) {
    const promises = userIds.map(userId =>
      createNotification(userId, type, title, message, data)
    );
    await Promise.all(promises);
  }

  static async getUsersForDeadlineReminders(): Promise<Array<{userId: number, scholarshipId: number, scholarshipName: string, daysLeft: number}>> {
    // Get users who have saved scholarships with deadlines within 7 days
    const [rows] = await pool.execute(`
      SELECT DISTINCT
        us.userId,
        s.id as scholarshipId,
        s.name as scholarshipName,
        DATEDIFF(s.deadline, CURDATE()) as daysLeft
      FROM user_saved_scholarships us
      JOIN scholarships s ON us.scholarshipId = s.id
      WHERE s.deadline > CURDATE()
        AND DATEDIFF(s.deadline, CURDATE()) <= 7
        AND s.isActive = TRUE
    `);

    return rows as Array<{userId: number, scholarshipId: number, scholarshipName: string, daysLeft: number}>;
  }

  static async getUsersForNewScholarships(scholarshipId: number): Promise<number[]> {
    // Get users who might be interested in new scholarships based on their saved scholarships
    const [rows] = await pool.execute(`
      SELECT DISTINCT us.userId
      FROM user_saved_scholarships us
      JOIN scholarships s ON us.scholarshipId = s.id
      WHERE s.id = ?
    `, [scholarshipId]);

    return (rows as Array<{userId: number}>).map(row => row.userId);
  }
}
