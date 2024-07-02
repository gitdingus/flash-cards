'use server';

import { auth } from '@/auth';
import { sql } from '@vercel/postgres';
import { v4 as uuid } from 'uuid';

export interface GetNotificationsConfig {
  limit?: number,
  offset?: number, 
  viewed?: boolean,
}

export async function getNotifications(userId: string, configOptions?: GetNotificationsConfig) {
  const session = await auth();

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (session.user.userId !== userId) {
    throw new Error('Forbidden');
  }

  let limit = null;
  let offset = 0;

  if (configOptions) {
    if (configOptions.limit) {
      limit = configOptions.limit + 1;
    }

    if (configOptions.offset) {
      offset = configOptions.offset;
    }
  }

  let notificationsQuery;

  const unreadNotificationsQuery = sql`
    SELECT *
    FROM notification
    WHERE recipient = ${userId}
      AND viewed = false
    ORDER BY datecreated DESC
    LIMIT ${limit}
    OFFSET ${offset}
  ;`;

  const allNotificationsQuery = sql`
    SELECT *
    FROM notification
    WHERE recipient = ${userId}
    ORDER BY datecreated DESC
    LIMIT ${limit}
    OFFSET ${offset}
  ;`;

  switch (configOptions?.viewed) {
    case false:
      notificationsQuery = await unreadNotificationsQuery;
      break;
    default:
      notificationsQuery = await allNotificationsQuery;
      break;
  }

  const notifications: NotificationBase[] = notificationsQuery.rows
  .filter((row, index) => limit === null || (limit !== null && index < limit - 1))
  .map(
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

  return {
    notifications,
    hasMore: notificationsQuery.rowCount > notifications.length,
  };
}