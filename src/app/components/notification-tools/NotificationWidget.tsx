'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from "next-auth";
import { getNotifications } from "@/app/lib/notifications";
import { markNotificationAsRead } from '@/actions/notification-actions';
import Image from 'next/image';
import LinkMarkDownTransformer from "@/app/components/markdown-components/LinkMarkDownTransformer";
import plainBell from '@/app/images/bell-outline.svg';
import alertBell from '@/app/images/bell-badge-outline.svg';
import styles from '@/app/styles/notification-widget/notification-widget.module.css';

interface NotificationWidgetConfig {
  session: Session,
}

export default function NotificationWidget({ session }: NotificationWidgetConfig) {
  const [currentNotifications, setCurrentNotifications] = useState<NotificationBase[]>([]);
  const [moreNotifications, setMoreNotifications] = useState(false);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const notificationList = useRef<HTMLUListElement>(null);
  const router = useRouter();

  useEffect(() => {
    getNotifications({ limit: 5, viewed: false })
      .then((data) => {
        const { notifications, hasMore } = data;
        setCurrentNotifications(notifications);
        setMoreNotifications(hasMore);
      });
  }, [session.user.userId]);

  useEffect(() => {
    function hideNotificationList(e: MouseEvent) {
      if (notificationList.current 
        && showNotificationList
        && e.target !== notificationList.current
        && e.target instanceof Node
        && !notificationList.current.contains(e.target)) {
          setShowNotificationList(false);
      }
    }

    if (showNotificationList) {
      document.addEventListener('click', hideNotificationList);
    }

    return () => {
      document.removeEventListener('click', hideNotificationList);
    }
  }, [showNotificationList]);

  function unreadNotifications() {
    if (
      moreNotifications 
      || currentNotifications.some((notification) => notification.viewed === false)
    ){
      return true;
    }

    return false;
  }

  function getIcon() {
    if (unreadNotifications()) {
      return (
        <Image 
          src={alertBell} 
          height={24} 
          width={24} 
          alt='there are new notifications' 
          title='There are unread notifications' 
          onClick={() => {
            setShowNotificationList(!showNotificationList);
          }}
        />
      )
    } else {
      return (
        <Image 
          src={plainBell} 
          height={24} 
          width={24} 
          alt='no new notifications' 
          title='No new notifications' 
          onClick={() => {
            setShowNotificationList(!showNotificationList);
          }}
        />
      )
    }
  }

  return (
    <div className={styles.notificationWidget}>
      <div>
        {
          getIcon()
        }
      </div>
      <ul ref={notificationList} className={`${styles.notificationList} ${showNotificationList ? styles.expanded : ''}`}>
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
          <li><a href='/user/notifications'>{`View ${moreNotifications ? 'more' : 'all'} notifications`}</a></li>
        </ul>
    </div>
  )
}