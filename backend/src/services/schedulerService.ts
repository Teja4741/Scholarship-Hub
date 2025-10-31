import cron from 'node-cron';
import { NotificationService } from './notificationService';
import { EmailService } from './emailService';

export class SchedulerService {
  static startScheduledTasks() {
    // Send deadline reminders daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily deadline reminder task...');
      try {
        const reminders = await NotificationService.getUsersForDeadlineReminders();

        for (const reminder of reminders) {
          await NotificationService.sendDeadlineReminder(
            reminder.userId,
            reminder.scholarshipId,
            reminder.scholarshipName,
            reminder.daysLeft
          );

          // Also send email reminder
          const [userRows] = await import('../database').then(m => m.default.execute(
            'SELECT email, firstName, lastName FROM users WHERE id = ?',
            [reminder.userId]
          ));

          if ((userRows as any[]).length > 0) {
            const user = (userRows as any[])[0];
            await EmailService.sendDeadlineReminderEmail(
              user.email,
              `${user.firstName} ${user.lastName}`,
              reminder.scholarshipName,
              reminder.daysLeft
            );
          }
        }

        console.log(`Sent ${reminders.length} deadline reminders`);
      } catch (error) {
        console.error('Error in deadline reminder task:', error);
      }
    });

    // Send new scholarship alerts weekly on Mondays at 10 AM
    cron.schedule('0 10 * * 1', async () => {
      console.log('Running weekly new scholarship alert task...');
      try {
        // This would be triggered when new scholarships are added
        // For now, we'll implement a basic version that checks for recently added scholarships
        const [scholarships] = await import('../database').then(m => m.default.execute(
          'SELECT id, name FROM scholarships WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND isActive = TRUE'
        ));

        for (const scholarship of scholarships as any[]) {
          const interestedUsers = await NotificationService.getUsersForNewScholarships(scholarship.id);

          for (const userId of interestedUsers) {
            await NotificationService.sendNewScholarshipAlert(userId, scholarship.id, scholarship.name);
          }
        }

        console.log('New scholarship alerts sent');
      } catch (error) {
        console.error('Error in new scholarship alert task:', error);
      }
    });

    console.log('Scheduled tasks initialized');
  }
}
