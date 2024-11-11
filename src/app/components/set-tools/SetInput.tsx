'use client';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { createSet } from '@/actions/set-actions';
import CardInput from './CardInput';
import Image from 'next/image';
import '@/app/styles/set-tools/set-input.css';
import addCardSvg from '@/app/images/plus.svg';
import cancelAddCardSvg from '@/app/images/close.svg';
import collapseCardsSvg from '@/app/images/minus.svg';
import expandCardsSvg from '@/app/images/chevron-down.svg';

interface SetInputProps {
  submitAction: ({ newSet, cardsInSet }: { newSet: SetInfoBase, cardsInSet: CardInSet[]}, formData: FormData) => void,
  saveLine?: (line: Line, card: CardBase) => void,
  editLine?: (line: Line) => void,
  removeLine?: (line: Line) => void,
  saveCard?: (card: CardBase) => void,
  editCard?: (card: CardBase) => void,
  removeCard?: (card: CardBase) => void,
  set?: SetOfCards,
}

export default function SetInput({ submitAction, saveLine, editLine, removeLine, saveCard, editCard, removeCard, set }: SetInputProps) {
  const [ setTitle, setSetTitle ] = useState(set?.title || '');
  const [ description, setDescription ] = useState(set?.description || '');
  const [ cards, setCards ] = useState<CardBase[]>(set?.cards || []);
  const [ isPublic, setIsPublic ] = useState(set ? set.isPublic : true);
  const [ cardsHidden, setCardsHidden ] = useState(false);
  const [ showCardInput, setShowCardInput ] = useState(false);
  const [ activeCard, setActiveCard ] = useState<CardBase | null>(null);

  const compileSetData = () => {
    const now = new Date();
    const newSet: SetInfoBase = {
      id: set?.id || uuid(),
      title: setTitle,
      description: description,
      dateCreated: set?.dateCreated || now,
      isPublic,
      lastModified: set?.lastModified || now,
    }

    const cardsInSet = cards.map((card) => {
      const cardInSet: CardInSet = {
        ...card,
        inSet: newSet.id,
      }

      return cardInSet;
    });

    return { newSet, cardsInSet };
  }
  const submitActionWithData = submitAction.bind(null, compileSetData());

  const defaultSaveCard = (card: CardBase) => {
    const newCards = cards.slice();
    newCards.push(card);
    setCards(newCards);
  }

  const defaultEditCard = (newCard: CardBase) => {
    const newCards = cards.slice();
    const oldCardIndex = newCards.findIndex((card) => card.id === newCard.id);

    newCards.splice(oldCardIndex, 1, newCard);

    setCards(newCards);
    setActiveCard(null);
  }

  const defaultRemoveCard = (removeCard: CardBase) => {
    const newCards = cards.slice();
    const cardIndex = newCards.findIndex((card) => card.id === removeCard.id);

    newCards.splice(cardIndex, 1);
    setCards(newCards);
  }

  return (
    <div className="form-container card-input-container">
      <form action={submitActionWithData}>
        <div>
          <h2>Set Information</h2>
          <div className="form-input">
            <label htmlFor="setTitle">
              Title
            </label>
            <input
              id="setTitle"
              type="text"
              value={setTitle}
              onChange={(e) => { setSetTitle(e.target.value) }}
            />
          </div>
          <div className="form-input">
            <label htmlFor="setDescription">
              Description
            </label>
            <textarea
              id="setDescription"
              value={description}
              onChange={(e) => { setDescription(e.target.value) }}
            ></textarea>
          </div>
        </div>
        <div>
          <div>
            <h2>Cards</h2>
            <button type="button" onClick={() => setCardsHidden(!cardsHidden)}>
              {
                cardsHidden ?
                <Image src={expandCardsSvg} alt="expand cards" height={25} width={25} /> :
                <Image src={collapseCardsSvg} alt="collapse cards" height={25} width={25} />
              }
            </button>
            <button 
              type="button" 
              onClick={() => {
                setActiveCard(null);
                setShowCardInput(!showCardInput);
              }}
            >
              {
                showCardInput ?
                <Image src={cancelAddCardSvg} alt="add card" height="25" width="25" /> :
                <Image src={addCardSvg} alt="cancel add card" height={25} width={25} />
              }
            </button>
          </div>
          <div className={`cards ${cardsHidden ? 'collapsed' : ''}`}>
            {
              cards.length > 0 && 
              cards.map((card, index) => {
                return (
                  <div key={card.id}>
                    <p>{card.front.title}</p>
                    <button type="button"
                      onClick={() => {
                        setActiveCard(card);
                        setShowCardInput(true);
                      }}
                    >
                      Edit
                    </button>
                    <button type="button"
                      onClick={() => {
                        defaultRemoveCard(card);
                        if (removeCard) {
                          removeCard(card);
                        }
                      }}
                    >
                      Delete
                    </button>
                    <ul>
                      {
                        card.back.lines.map((line, lineIndex) => {
                          return (
                            <li key={`card-${index}line-${lineIndex}`}>
                              <p><span>{line.heading}</span>: <span>{line.content}</span></p>
                            </li>
                          )
                        })
                      }
                    </ul>
                  </div>
                )
              })
              ||
              <p>No cards to display</p>
            }
          </div>
          {
            showCardInput && 
            <div className={`card-input`}>
              <button onClick={() => setShowCardInput(false)}>Close</button>
              {
                activeCard !== null &&
                <CardInput
                  key={activeCard?.id}
                  saveCard={(newCard) => {
                    defaultEditCard(newCard)
                    if (editCard) {
                      editCard(newCard);
                    }
                    setShowCardInput(false)
                  }}
                  removeLine={ removeLine ? removeLine : undefined }
                  editLine={ editLine ? editLine : undefined }
                  saveLine={ saveLine ? saveLine : undefined }
                  card={activeCard}
                />
              }
              {
                activeCard === null &&
                <CardInput
                  saveCard={(card) => {
                    defaultSaveCard(card)
                    if (saveCard) {
                      saveCard(card);
                    }
                    setShowCardInput(false);
                  }}
                />
              }
            </div>
          }
        </div>
        <div>
          <label htmlFor="publicCheckbox">
            Public
          </label>
          <input id="publicCheckbox" type="checkbox" name="public" defaultChecked={isPublic} onChange={(e) => setIsPublic(!isPublic)} />
        </div>
        <button type="submit">Create Set</button>
      </form>
    </div>
  )
}