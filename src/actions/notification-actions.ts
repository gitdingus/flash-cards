'use server';
import { auth } from  '@/auth';
import { getNotifications, GetNotificationsConfig } from "@/app/lib/notifications";
import { sql } from '@vercel/postgres';

interface PopulateNotificationsConfig {
  page: number,
  results: number, 
}

export async function populateNotifications(options: PopulateNotificationsConfig) {
  const session = await auth();

  if (!session) {
    throw new Error('Unauthorized');
  }

  const notificationsConfig: GetNotificationsConfig = {
    limit: options.results,
    offset: options.results * options.page,
  }

  const notifications = await getNotifications(session.user.userId, notificationsConfig);

  return notifications;
}

export async function markNotificationAsRead(notificationId: string) {
  const [ session, notification ]  = await Promise.all([
    auth(),
    sql`
      SELECT * FROM notification WHERE id = ${notificationId}
    ;`,
  ]);

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (notification.rowCount === 0) {
    throw new Error('Not found');
  }

  if (session.user.userId !== notification.rows[0].recipient) {
    throw new Error('Forbidden');
  }

  await sql`
    UPDATE notification
    SET viewed = true
    WHERE id = ${notificationId}
  ;`
}