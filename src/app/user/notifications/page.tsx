'use client';
import { useContext, useEffect, useState } from 'react';
import Notification from '@/app/components/notification-tools/Notification';
import { getNotifications } from '@/app/lib/notifications';
import { markNotificationAsRead } from '@/actions/notification-actions';
import { SessionContext } from '@/app/context/SessionContext';

interface NotificationProps {
  searchParams: {
    page: string,
    results: string,
  }
}

type NotificationType = 'all' | 'unread';

export default function Notifications(props: NotificationProps) {
  const [currentNotifications, setCurrentNotifications] = useState<NotificationBase[]>([]);
  const [notificationType, setNotificationType] = useState<NotificationType>('unread');
  const [moreNotifications, setMoreNotifications] = useState(false);
  const session = useContext(SessionContext);

  useEffect(() => {
    if (!session) {
      return;
    }

    const config = {
      viewed: notificationType === 'unread' ? false : true,
      limit: 10,
      offset: 0,
    }

    getNotifications(config)
      .then(async ({ notifications, hasMore }) => {
        setCurrentNotifications(notifications);
        setMoreNotifications(hasMore);

        await markNotificationAsRead(notifications.map((notification) => notification.id));
      })
      .catch((err) => {
        console.log(err);
      });
  }, [notificationType, session]);
  
  function loadMoreNotifications() {
    const config = {
      viewed: notificationType === "unread" ? false : true,
      limit: 10,
      offset: notificationType === 'unread' ? 0 : currentNotifications.length,
    }
    getNotifications(config)
      .then(async ({notifications, hasMore}) => {
        const allNotifications = currentNotifications.concat(notifications);

        setCurrentNotifications(allNotifications);
        setMoreNotifications(hasMore);
        
        await markNotificationAsRead(notifications.map((notification) => notification.id));
      })
      .catch((err) => {
        console.log(err);
      });
  }

  if (!session) {
    return <p>Please login to view this page</p>
  }
  return (
    <div>
      <fieldset>
        <legend>View notifications</legend>
        <label>
          Unread
          <input type="radio" name="type" value="unread" onClick={() => setNotificationType('unread')} defaultChecked />
        </label>
        <label>
          All
          <input type="radio" name="type" value="all" onClick={() => setNotificationType('all')}/>
        </label>
      </fieldset>
      {
        (
          currentNotifications.length &&
          currentNotifications.map((notification) => {
            return <Notification key={notification.id} notification={notification} />
          })
        ) ||
        <p>You have no new notifications at this time</p>
      }
      {
        moreNotifications &&
        <button type="button" onClick={() => loadMoreNotifications()}>Load More Notifications</button>
      }
    </div>
  )
}