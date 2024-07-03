'use server';
import { auth } from  '@/auth';
import { getNotifications, GetNotificationsConfig } from "@/app/lib/notifications";
import { sql, db } from '@vercel/postgres';

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

  const notifications = await getNotifications(notificationsConfig);

  return notifications;
}

export async function markNotificationAsRead(notificationId: string | string[]) {
  const session = await auth();

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (notificationId === '' || notificationId.length === 0) {
    return;
  }

  if (!Array.isArray(notificationId)) {
    notificationId = [notificationId];
  }

  const valuesStr = notificationId.map((val, index) => `$${index + 1}`).join(', ');
  const selectQueryStr = `SELECT * FROM notification WHERE id IN (${valuesStr});`;
  const updateQueryStr = `UPDATE notification SET viewed = true WHERE id IN (${valuesStr});`;

  const client = await db.connect();

  const selectQuery = await client.query(selectQueryStr, notificationId);

  const allOwnedByLoggedInUser = selectQuery.rows.every((row) => row.recipient === session.user.userId);

  if (!allOwnedByLoggedInUser) {
    throw new Error('Can not complete request');
  }

  const updateQuery = await client.query(updateQueryStr, notificationId);
  client.release();

}