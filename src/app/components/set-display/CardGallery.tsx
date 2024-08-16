'use client';

import { useState } from 'react';
import ExpandableCard from "./ExpandableCard";
import CardSlides from './CardSlides';
import MemoryGame from './MemoryGame';
import styles from '@/app/styles/set/card-gallery.module.css';

interface CardGalleryProps {
  cards: CardBase[],
}

type DisplayOptions = "list" | "slides" | "memory-game";

export default function CardGallery({ cards }: CardGalleryProps) {
  const [display, setDisplay] = useState<DisplayOptions>("list");
  
  return (
    <div className={`${styles.cardGallery}`}>
      <div className={styles.galleryOptions}>
        <button className={display === "list" ? styles.active : ''} type="button" onClick={() => setDisplay("list")}>List</button>
        <button className={display === "memory-game" ? styles.active : ''} type="button" onClick={() => setDisplay("memory-game")}>Memory Game</button>
        <button className={display === "slides" ? styles.active : ''} type="button" onClick={() => setDisplay("slides")}>Slides</button>
      </div>
      {
        display === "list" &&
        <div className={`${styles.galleryDisplay}`}>
          {
            cards.map((card) => {
              return(
                <ExpandableCard key={card.id} card={card} />
              )
            })
          }
        </div>
      }
      {
        display === "slides" &&
        <CardSlides cards={cards} />
      }
      {
        display === "memory-game" &&
        <MemoryGame cards={cards} />
      }
    </div>
  )
}