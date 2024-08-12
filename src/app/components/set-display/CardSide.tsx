import { useState } from 'react';
import styles from '@/app/styles/set/card/card-side.module.css';

type FrontBack = "front" | "back";

interface CardSideProps {
  cardId: string,
  children: React.ReactNode,
  side: FrontBack,
  status: "none" | "selected" | "matched",
  sideSelected: (cardId: string, side: FrontBack) => void,
}

export default function CardSide({children, cardId, side, status, sideSelected}: CardSideProps) {
  function clicked() {
    if (status === "matched") {
      return;
    }
    sideSelected(cardId, side);
  }

  function getStyling() {
    switch (status) {
      case "selected":
        return styles.selected;
      case "matched":
        return styles.matched;
      default:
        return '';
    }
  }
  return (
    <div onClick={clicked} className={`${styles.side} ${getStyling()}`}>
      {children}
    </div>
  )
}