'use client';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { createSet } from '@/actions/card-actions';
import CardInput from './CardInput';

export default function CreateSet() {
  const [ setTitle, setSetTitle ] = useState('');
  const [ description, setDescription ] = useState('');
  const [ cards, setCards ] = useState<CardBase[]>([]);
  const [ activeCard, setActiveCard ] = useState<CardBase | null>();
  const [ isPublic, setIsPublic ] = useState(true);

  const compileSetData = () => {
    const set: CardSet = {
      id: uuid(),
      title: setTitle,
      description: description,
      dateCreated: new Date(),
      isPublic,
    }

    const cardsInSet = cards.map((card) => {
      const cardInSet: CardInSet = {
        ...card,
        inSet: set.id,
      }

      return cardInSet;
    });

    return { set, cardsInSet };
  }
  const createSetWithData = createSet.bind(null, compileSetData());

  const saveCard = (card: CardBase) => {
    const newCards = cards.slice();
    newCards.push(card);
    setCards(newCards);
  }

  return (
    <div>
      <form action={createSetWithData}>
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
                      const newCards = cards.slice();
                      newCards.splice(index, 1);
                      setCards(newCards);
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
                const newCards = cards.slice();
                const oldCardIndex = cards.findIndex((card) => card.id === newCard.id);

                newCards.splice(oldCardIndex, 1, newCard);

                setCards(newCards);
                setActiveCard(null);
              }}
              card={activeCard}
            />
          }
          {
            activeCard === null &&
            <CardInput saveCard={saveCard} />
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