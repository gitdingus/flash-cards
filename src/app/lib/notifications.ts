import { auth } from '@/auth';
import { sql } from '@vercel/postgres';
import { v4 as uuid } from 'uuid';

interface NotificationConfig {
  type: NotificationType,
  recipient: PublicUser,
  subject?: string,
  content?: string
}

function defaultNotificationSubject(type: NotificationType) {
  switch (type) {
    case 'mod-action':
      return 'A moderator has taken action on your account.';
    case 'new-follower':
      return 'A new user has followed your account.';
    case 'new-set':
      return `Someone you've followed has created a new set of cards!`;
    case 'set-permission-granted':
      return 'You have been granted access to a set of cards';
    case 'set-permission-revoked':
      return 'Your access to a set of cards has been revoked';
  }
}

export function createNotification({ type, recipient, subject, content }: NotificationConfig) {
  const notification: AppNotification = {
    id: uuid(),
    type: type,
    subject: defaultNotificationSubject(type) || subject,
    content: content || '', 
    recipient: recipient,
    viewed: false,
    dateCreated: new Date()
  }

  return notification;
}

export async function getUnreadNotifications(userId: string) {
  const session = await auth();

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (session.user.userId !== userId) {
    throw new Error('Forbidden');
  }

  const unreadNotificationsQuery = await sql`
    SELECT *
    FROM notification
    WHERE recipient = ${userId}
    ORDER BY datecreated DESC;
  `;

  const notifications: NotificationBase[] = unreadNotificationsQuery.rows.map(
    (notificationRow) => {
      const notification: NotificationBase = {
        id: notificationRow.id,
        type: notificationRow.type,
        subject: notificationRow.subject,
        content: notificationRow.content,
        viewed: notificationRow.viewed,
        dateCreated: new Date(notificationRow.datecreated),
      }

      return notification;
    }
  );

  return notifications;
}