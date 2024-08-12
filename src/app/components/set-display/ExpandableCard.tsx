'use client';
import { useEffect, useState } from 'react';
import { getCardData } from '@/actions/set-actions';
import styles from '@/app/styles/set/card/expandable-card.module.css';

interface Props {
  card: CardBase,
  hideTitleOnFlip?: boolean,
  children?: React.ReactNode,
}

type ActiveSide = "front" | "back";
export default function ExpandableCard({ card, hideTitleOnFlip = false, children }: Props) {
  const [activeSide, setActiveSide] = useState<ActiveSide>("front");

  useEffect(() => {
    setActiveSide('front');
  }, [card])
  
  const click = () => {
    if (activeSide === 'front') {
      setActiveSide('back');
    } else if (activeSide === 'back') {
      setActiveSide('front');
    }
  }

  const titleClassName = () => {
    if (activeSide === 'front') {
      return styles.active;
    } else if (activeSide === 'back' && !hideTitleOnFlip) {
      return styles.active;
    }

    return '';
  }
  return (
    <div onClick={click} className={styles.expandableCard}>
      <div className={`${titleClassName()}`}>{card.front.title}</div>
      <div className={`${activeSide === 'back' ? styles.active : ''}`}>
        <ul>
          {
            card.back.lines.map((line) => {
              return (
                <li key={`${card.id}-${line.heading}`}>
                  <p><span>{line.heading}</span>: <span>{line.content}</span></p>
                </li>
              )
            })
          }
        </ul>
      </div>
    </div>
  )
}