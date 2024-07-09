'use client';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { createSet } from '@/actions/set-actions';
import CardInput from './CardInput';

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
    <div>
      <form action={submitActionWithData}>
        <div>
          <h2>Set Information</h2>
          <div>
            <label>
              Title
              <input
                id="setTitle"
                type="text"
                value={setTitle}
                onChange={(e) => { setSetTitle(e.target.value) }}
              />
            </label>
          </div>
          <div>
            <label>
              Description
              <textarea
                id="setDescription"
                value={description}
                onChange={(e) => { setDescription(e.target.value) }}
              ></textarea>
            </label>
          </div>
        </div>
        <div>
          <h2>Cards</h2>
          {
            cards.map((card, index) => {
              return (
                <div key={card.id}>
                  <p>{card.front.title}</p>
                  <button type="button" 
                    onClick={() => {
                      setActiveCard(card);
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
          }
          {
            activeCard !== null &&
            <CardInput 
              key={activeCard?.id}
              saveCard={(newCard) => {
                defaultEditCard(newCard)
                if (editCard) {
                  editCard(newCard);
                }
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
                if (saveCard) 
                  saveCard(card);
              }} 
            />
          }
        </div>
        <div>
          <label>
            Public
            <input type="checkbox" name="public" defaultChecked={isPublic} onChange={(e) => setIsPublic(!isPublic)} />
          </label>
        </div>
        <button type="submit">Create Set</button>
      </form>
    </div>
  )
}