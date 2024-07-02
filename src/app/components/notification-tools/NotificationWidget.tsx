'use client';

import { useState, useEffect } from 'react';
import { Session } from "next-auth"
import { getNotifications } from "@/app/lib/notifications"
import LinkMarkDownTransformer from "@/app/components/markdown-components/LinkMarkDownTransformer";

interface NotificationWidgetConfig {
  session: Session,
}

export default function NotificationWidget({ session }: NotificationWidgetConfig) {
  const [currentNotifications, setCurrentNotifications] = useState<NotificationBase[]>([]);
  const [moreNotifications, setMoreNotifications] = useState(false);

  useEffect(() => {
    getNotifications(session.user.userId, { limit: 5, viewed: false })
      .then((data) => {
        const { notifications, hasMore } = data;
        setCurrentNotifications(notifications);
        setMoreNotifications(hasMore);
      });
  }, [session.user.userId]);

  if (currentNotifications.length === 0) {
    return <div>No new notifications</div>
  } else {
    return (
      <div>
        <p>You have {currentNotifications.length} unread notification(s)</p>
        <ul>
          {
            currentNotifications.map((notification) => {
              return (
                <li key={notification.id} onClick={(e) => { console.log('clicked muthafucka')}}>
                  <div>
                    <LinkMarkDownTransformer baseUrl={window.location.host} text={notification.content} />
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