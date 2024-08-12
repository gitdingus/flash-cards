'use client';
import { useEffect, useState } from 'react';
import CardSide from './CardSide';
import styles from '@/app/styles/set/card-memory-game.module.css';

interface MemoryGameProps {
  cards: CardBase[];
}

type FrontBack = "front" | "back";
type CardStatus = "none" | "selected" | "matched";

interface CardSideStatus {
  cardId: string,
  side: FrontBack,
  status: CardStatus,
}


export default function MemoryGame({ cards }: MemoryGameProps) {
  const [cardStatuses, setCardStatuses] = useState<CardSideStatus[]>(initialCardStatuses(cards));

  useEffect(() => {
    const newCardStatuses = cards.flatMap((card) => {
      const front: CardSideStatus = {
        cardId: card.id,
        side: 'front',
        status: 'none'
      }

      const back: CardSideStatus = {
        cardId: card.id,
        side: 'back',
        status: 'none',
      }

      return [ front, back ];
    });

    const shuffledStatuses = shuffle(newCardStatuses);
    setCardStatuses(shuffledStatuses);
  }, [cards]);

  useEffect(() => {
    const newCardStatuses = cardStatuses.slice();
    const selectedCards = newCardStatuses.filter((cardStatus) => cardStatus.status === 'selected');

    if (cardStatuses.every((cardStatus) => cardStatus.status === 'matched')) {
      return;
    }

    if (selectedCards.length < 2) return;

    if (selectedCards.length === 2) {
      if (selectedCards[0].cardId === selectedCards[1].cardId
        && selectedCards[0].side !== selectedCards[1].side) {
          selectedCards[0].status = "matched";
          selectedCards[1].status = "matched";
      } else {
        selectedCards[0].status = "none";
        selectedCards[1].status = "none";
      }

      setCardStatuses(newCardStatuses);
    }
  }, [cardStatuses]);

  function sideSelected(cardId: string, side: string) {
    const newCardStatuses = cardStatuses.slice();
    const newCardStatus = newCardStatuses.find((cardStatus) => cardStatus.cardId === cardId && cardStatus.side === side);

    if (!newCardStatus) return;

    newCardStatus.status = 'selected';
    setCardStatuses(newCardStatuses);
  }

  return (
    <div className={styles.memoryGame}>
      {
        cardStatuses.map((status) => {
          const currentCard = cards.find((card) => card.id === status.cardId);

          if (!currentCard) return;

          if (status.side === 'front') {
            return (
              <CardSide 
                key={`${status.cardId}-front`} 
                cardId={`${status.cardId}`} 
                side="front" 
                status={status.status}
                sideSelected={sideSelected}
              >
                <div className={styles.front}>
                  { currentCard.front.title }
                </div>
              </CardSide>
            )
          } else if (status.side === 'back') {
            return (
              <CardSide 
              key={`${status.cardId}-back`} 
              cardId={`${status.cardId}`} 
              side="back" 
              status={status.status}
              sideSelected={sideSelected}
            >
              <div className={styles.back}>
                <ul>
                  {
                    currentCard.back.lines.map((line) => {
                      return (
                        <li key={line.id}><span className={styles.lineHeading}>{line.heading}</span>: {line.content}</li>
                      )
                    })
                  }
                </ul>
              </div>
            </CardSide>
            )
          }
        })
      }  
    </div>
  )
}

function initialCardStatuses(cards: CardBase[]): CardSideStatus[] {
  return cards.flatMap((card) => {
    return [
      {
        cardId: card.id,
        side: "front",
        status: "none",
      },
      {
        cardId: card.id,
        side: "back",
        status: "none",
      },
    ];
  });
}

function shuffle<T>(arr: T[]): T[] {
  const copiedArray = arr.slice();
  const newArray: T[] = [];

  while (copiedArray.length > 0) {
    const randomIndex = Math.floor(Math.random() * copiedArray.length);
    newArray.push(...copiedArray.splice(randomIndex, 1));
  }

  return newArray;
}