import { createNotification } from '../services/NotificationService';
import { ReportData } from '../services/ReportService';

/**
 * Creates a test notification for a user
 * @param userId The user ID to send the notification to
 * @returns Promise that resolves when notification is created
 */
export const createTestNotification = async (userId: string): Promise<boolean> => {
  return await createNotification({
    user_id: userId,
    title: 'Test Notification',
    message: 'This is a test notification to verify the notification system is working correctly.',
    type: 'info',
    read: false
  });
};

/**
 * Creates a status update notification for a report
 * @param report The report that was updated
 * @param newStatus The new status of the report
 * @returns Promise that resolves when notification is created
 */
export const createStatusUpdateNotification = async (
  report: ReportData, 
  newStatus: string
): Promise<boolean> => {
  // Craft a notification based on the new status
  let title = '';
  let message = '';
  let type: 'info' | 'success' | 'warning' | 'error' = 'info';
  
  switch (newStatus) {
    case 'In Review':
      title = 'Report Status Update';
      message = `Your report "${report.title}" is now being reviewed by our team.`;
      type = 'info';
      break;
    case 'Forwarded':
      title = 'Report Forwarded';
      message = `Your report "${report.title}" has been forwarded to the relevant department for action.`;
      type = 'info';
      break;
    case 'Resolved':
      title = 'Report Resolved!';
      message = `Great news! Your report "${report.title}" has been successfully resolved.`;
      type = 'success';
      break;
    default:
      title = 'Report Status Update';
      message = `The status of your report "${report.title}" has been updated to "${newStatus}".`;
      type = 'info';
  }
  
  // Create the notification
  return await createNotification({
    user_id: report.user_id,
    title,
    message,
    type,
    read: false,
    related_report_id: report.report_id
  });
};
