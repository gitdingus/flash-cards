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
import editSvg from '@/app/images/text-box-edit-outline.svg';
import deleteSvg from '@/app/images/trash-can-outline.svg';

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
    <div className="form-container">
      <form action={submitActionWithData} id="set-form">
        <div>
          <div className="title-bar">
            <h2>Set</h2>
          </div>
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
          <div className="title-bar cards-title-bar">
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
          <div className={`card-input-container ${showCardInput ? 'expanded' : ''}`}>
            <div className={`card-input`}>
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
          </div>  
          <div className={`cards-list ${cardsHidden ? 'collapsed' : ''}`}>
            {
              cards.length > 0 && 
              cards.map((card, index) => {
                return (
                  <CardLine 
                    key={card.id}
                    card={card}
                    cardActions={{
                      click: (card) => {console.log('clicked', card.front.title)},
                      edit: (card) => {
                        setActiveCard(card);
                        setShowCardInput(true);
                      },
                      delete: (card) => {
                        defaultRemoveCard(card);
                        if (removeCard) {
                          removeCard(card);
                        }
                      }
                    }}
                  />
                )
              })
              ||
              <p>No cards to display</p>
            }
          </div>
        </div>
        <div>
          <label htmlFor="publicCheckbox">
            Public
          </label>
          <input id="publicCheckbox" type="checkbox" name="public" defaultChecked={isPublic} onChange={(e) => setIsPublic(!isPublic)} />
        </div>
        <div className="buttons"><button type="submit">Create Set</button></div>
      </form>
    </div>
  )
}

interface CardLineProps {
  card: CardBase,
  cardActions: {
    click: (card: CardBase) => void,
    edit: (card: CardBase) => void,
    delete: (card: CardBase) => void,
  }
}

function CardLine({ card, cardActions }: CardLineProps) {
  const [ expandDetails, setExpandDetails ] = useState(false);

  return (
    <div className="card" key={card.id}>
      <div className="card-title">
        <p onClick={() => setExpandDetails(!expandDetails)}>{card.front.title}</p>
        <button type="button"
          onClick={() => {
            cardActions.edit(card);
          }}
        >
          <Image src={editSvg} alt={`edit card ${card.front.title}`} width={25} height={25} />
        </button>
        <button type="button"
          onClick={() => {
            cardActions.delete(card);
          }}
        >
          <Image src={deleteSvg} alt={`edit card ${card.front.title}`} width={25} height={25} />
        </button>
      </div>
      <div className={`card-lines ${expandDetails ? 'expanded' : ''}`}>
        <ul>
          {
            card.back.lines.map((line, lineIndex) => {
              return (
                <li key={`card-${card.id}line-${lineIndex}`}>
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