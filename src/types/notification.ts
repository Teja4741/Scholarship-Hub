export interface Notification {
  id: number;
  userId: number;
  type: 'application_status' | 'deadline_reminder' | 'new_scholarship' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  deadlineReminders: boolean;
  applicationUpdates: boolean;
  newScholarshipAlerts: boolean;
}
