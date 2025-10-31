import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export class EmailService {
  static async sendApplicationStatusEmail(
    to: string,
    studentName: string,
    scholarshipName: string,
    status: string
  ) {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key not configured, skipping email send');
      return;
    }

    const msg = {
      to,
      from: process.env.FROM_EMAIL || 'noreply@scholarhub.com',
      subject: `Application Status Update - ${scholarshipName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Application Status Update</h2>
          <p>Dear ${studentName},</p>
          <p>Your application for the scholarship <strong>${scholarshipName}</strong> has been updated.</p>
          <div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <strong>Status: ${status}</strong>
          </div>
          <p>Please log in to your account to view more details about your application.</p>
          <p>Best regards,<br>Gradious Scholar Hub Team</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log('Status update email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  static async sendDeadlineReminderEmail(
    to: string,
    studentName: string,
    scholarshipName: string,
    daysLeft: number
  ) {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key not configured, skipping email send');
      return;
    }

    const msg = {
      to,
      from: process.env.FROM_EMAIL || 'noreply@scholarhub.com',
      subject: `Scholarship Deadline Reminder - ${scholarshipName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Scholarship Deadline Reminder</h2>
          <p>Dear ${studentName},</p>
          <p>This is a reminder that the application deadline for <strong>${scholarshipName}</strong> is approaching.</p>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <strong>⏰ ${daysLeft} days remaining</strong>
          </div>
          <p>Don't miss out on this opportunity! Submit your application before the deadline.</p>
          <p>Best regards,<br>Gradious Scholar Hub Team</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log('Deadline reminder email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  static async sendWelcomeEmail(to: string, studentName: string) {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key not configured, skipping email send');
      return;
    }

    const msg = {
      to,
      from: process.env.FROM_EMAIL || 'noreply@scholarhub.com',
      subject: 'Welcome to Gradious Scholar Hub!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Gradious Scholar Hub!</h2>
          <p>Dear ${studentName},</p>
          <p>Welcome to Gradious Scholar Hub! We're excited to help you find and apply for scholarships that can support your educational journey.</p>
          <p>Here's what you can do with your account:</p>
          <ul>
            <li>Browse and search for scholarships</li>
            <li>Save scholarships for later</li>
            <li>Apply for scholarships online</li>
            <li>Track your application status</li>
            <li>Receive notifications about deadlines and new opportunities</li>
          </ul>
          <p>Get started by exploring our scholarship database!</p>
          <p>Best regards,<br>Gradious Scholar Hub Team</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
