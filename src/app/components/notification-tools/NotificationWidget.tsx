'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from "next-auth";
import { getNotifications } from "@/app/lib/notifications";
import { markNotificationAsRead } from '@/actions/notification-actions';
import LinkMarkDownTransformer from "@/app/components/markdown-components/LinkMarkDownTransformer";

interface NotificationWidgetConfig {
  session: Session,
}

export default function NotificationWidget({ session }: NotificationWidgetConfig) {
  const [currentNotifications, setCurrentNotifications] = useState<NotificationBase[]>([]);
  const [moreNotifications, setMoreNotifications] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getNotifications({ limit: 5, viewed: false })
      .then((data) => {
        const { notifications, hasMore } = data;
        setCurrentNotifications(notifications);
        setMoreNotifications(hasMore);
      });
  }, [session.user.userId]);

  if (!moreNotifications && !currentNotifications.some((notification) => notification.viewed === false)) {
    return (
      <div>
        No new notifications
        <p><a href='/user/notifications'>View all notifications</a></p>

      </div>
    )
  } else {
    return (
      <div>
        { 
          (moreNotifications === true || currentNotifications.some((notification) => notification.viewed === false))
          && <p>You have unread notification(s)</p>
        }
        <ul>
          {
            currentNotifications.map((notification) => {
              return (
                <li key={notification.id} className={`${!notification.viewed ? 'unread' : ''}`} onClick={async (e) => { 
                  e.preventDefault();
                  try {
                    await markNotificationAsRead(notification.id);
                    const newNotifications = currentNotifications.slice();
                    const readNotification = newNotifications.find((readNotification) => readNotification.id === notification.id);

                    if (readNotification) {
                      readNotification.viewed = true;
                    }

                    setCurrentNotifications(newNotifications);

                  } catch (err) {
                    console.log('There was an error with your request');
                  } finally {
                    if (e.target instanceof HTMLAnchorElement) {
                      router.push(e.target.href);
                    }
                  }

                  return false;
                }}>
                  <div>
                    <LinkMarkDownTransformer baseUrl={window.location.origin} text={notification.content} />
                  </div>
                </li>
              )
            })
          }
        </ul>
        <p><a href='/user/notifications'>{`View ${moreNotifications ? 'more' : 'all'} notifications`}</a></p>
      </div>
    )
  }

}