import Notification from '../models/Notification.js';

export async function createNotification({ title, message, type = 'info', recipientType = 'all', recipientIds = [], createdBy = 'system', link = '' }) {
  try {
    const notification = new Notification({
      title, message, type, recipientType, recipientIds, createdBy, link, createdAt: new Date(),
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Notification creation error:', error.message);
  }
}

export async function notifyAllAdmins(title, message, type = 'info') {
  await createNotification({ title, message, type, recipientType: 'all' });
}

export async function notifySuperAdmin(title, message, type = 'info') {
  await createNotification({ title, message, type, recipientType: 'all' });
}
