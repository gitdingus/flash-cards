'use client';
import { useEffect, useState, useRef } from 'react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { isAdmin } from '@/app/lib/permissions';
import Image from 'next/image';
import NotificationWidget from '@/app/components/notification-tools/NotificationWidget';
import expandImage from '@/app/images/chevron-down.svg';
import collapseImage from '@/app/images/minus.svg';
import styles from '@/app/styles/authentication/user-settings.module.css';

interface UserSessionProps {
  session: Session | null,
}

export default function UserSession({ session, children }: UserSessionProps) {
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) {
      return;
    }

    isAdmin()
      .then((admin) => {
        if (admin) {
          setShowAdminLink(true);
        }
      });
  }, [session]);

  useEffect(() => {
    function hideOptionsMenu(e: MouseEvent) {
      if (optionsMenu.current
        && showOptionsMenu
        && e.target instanceof Node
        && e.target !== optionsMenu.current
        && !optionsMenu.current.contains(e.target)) {
          setShowOptionsMenu(false);
        }
    }

    if (showOptionsMenu) {
      document.addEventListener('click', hideOptionsMenu);
    }

    return () => {
      document.removeEventListener('click', hideOptionsMenu);
    }
  }, [showOptionsMenu]);

  if (!session) {
    return;
  }

  function toggleOptionsMenu() {
    setShowOptionsMenu(!showOptionsMenu);
  }

  function getOptionsMenuIcon() {
    if (showOptionsMenu) {
      return (
        <Image
          src={collapseImage}
          width={20}
          height={20}
          alt="Collapse options menu"
          onClick={toggleOptionsMenu}
        />
      )
    } else {
      return (
        <Image
          src={expandImage}
          width={20}
          height={20}
          alt="Collapse options menu"
          onClick={toggleOptionsMenu}
        />
      )
    }
  }
  return (
    <div className={styles.userSession}>
      <div>
        <p>Logged in as <a href={`/user/${session?.user.username}`}>{session?.user.username}</a></p>
        <div className={styles.optionsMenuContainer}>
          {
            getOptionsMenuIcon()
          }
          <div ref={optionsMenu} className={`${styles.optionsMenu} ${showOptionsMenu ? styles.expanded : ''}`}>
            <a href='/user/settings/'>Settings</a>
            <hr />
            <button onClick={async () => { await signOut() }}>Logout</button>
            <hr />
            {
              showAdminLink &&
              <div>
                <h1>Admin Links</h1>
                <hr />
                <a href="/reports">Reports</a>
              </div>
            }
          </div>
        </div>
        <NotificationWidget session={session} />
      </div>
    </div>
  )
}