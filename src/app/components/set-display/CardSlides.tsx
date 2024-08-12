import { useState } from 'react';
import Image from 'next/image';
import ExpandableCard from './ExpandableCard';
import prevImg from '@/app/images/chevron-left.svg';
import nextImg from '@/app/images/chevron-right.svg';
import randomImg from '@/app/images/shuffle-variant.svg';
import styles from '@/app/styles/set/card-slides.module.css';

interface CardSlidesProps {
  cards: CardBase[],
}

export default function CardSlides({ cards: initialCards }: CardSlidesProps) {
  const [cards, setCards] = useState<CardBase[]>(initialCards);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const nextCard = () => {
    let newIndex = activeCardIndex + 1;

    if (newIndex >= cards.length) {
      newIndex = 0;
    }

    setActiveCardIndex(newIndex);
  }

  const prevCard = () => {
    let newIndex = activeCardIndex - 1;

    if (newIndex < 0) {
      newIndex = cards.length - 1;
    }

    setActiveCardIndex(newIndex);
  }

  const randomizeCards = () => {
    let tempCards = cards.slice();
    let newCards: CardBase[] = [];
    let randomIndex: number;

    while (tempCards.length) {
      randomIndex = Math.floor(Math.random() * tempCards.length);
      newCards.push(tempCards.splice(randomIndex, 1)[0]);
    }

    setCards(newCards);
  }

  return (
    <div className={styles.cardSlides}>
      <div>
        <button type="button" onClick={prevCard}><Image alt='previous card' src={prevImg} width={30} height={30} /></button>
      </div>
      <div className={styles.cardArea}>
        <ExpandableCard card={cards[activeCardIndex]} hideTitleOnFlip={true} />
      </div>
      <div>
        <button type="button" onClick={nextCard}><Image alt='next card' src={nextImg} width={30} height={30}/></button>
      </div>
      <div className={styles.buttonBar}>
        <button type="button" onClick={randomizeCards}><Image alt='randomize cards' src={randomImg} title='Randomize Cards' width={30} height={30} /></button>
      </div>
    </div>
  )
}