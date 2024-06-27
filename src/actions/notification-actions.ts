'use server';
import { auth } from  '@/auth';
import { getNotifications, GetNotificationsConfig } from "@/app/lib/notifications";

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