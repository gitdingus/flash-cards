'use client';
import { useState } from 'react';
import SetPermissions from '@/app/components/set-tools/SetPermissions';
import CreateReport from '@/app/components/report/CreateReport';
import styles from '@/app/styles/user/set-footer.module.css';

type FooterOptions = "none" | "report" | "privacy";

export default function SetFooter({ set, ownSet, loggedIn }: { set: SetInfoBase, ownSet: boolean, loggedIn: boolean }) {
  const [ footerDisplay, setFooterDisplay ] = useState<FooterOptions>("none");

  function displayOption(option: FooterOptions) {
    if (option === footerDisplay) {
      setFooterDisplay("none");
      return;
    }

    setFooterDisplay(option);

  }
  return (
    <div className={styles.setFooter}>
      <div className={styles.buttons}>
        {
          ownSet &&
          <button onClick={() => displayOption('privacy')}>Privacy options</button>
        }
        {
          loggedIn && !ownSet &&
          <button onClick={() => displayOption('report')}>Report</button>
        }
      </div>
      <div className={styles.option}>
        {
          footerDisplay === "privacy" &&
          <SetPermissions set={set} />
        }
        {
          footerDisplay === "report" &&
          <CreateReport setId={set.id} />
        }
      </div>
    </div>
  )
}