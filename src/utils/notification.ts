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