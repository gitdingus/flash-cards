'use client';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import CardInput from './CardInput';

export default function CreateSet() {
  const [ setTitle, setSetTitle ] = useState('');
  const [ description, setDescription ] = useState('');
  const [ cards, setCards ] = useState<CardBase[]>([]);
  const [ activeCard, setActiveCard ] = useState<CardBase | null>();

  const createSet = () => {
    const set: CardSet = {
      id: uuid(),
      title: setTitle,
      description: description,
      dateCreated: new Date(),
    }

    const cardsInSet = cards.map((card) => {
      const cardInSet: CardInSet = {
        ...card,
        inSet: set.id,
      }

      return cardInSet;
    });

    const data = { set, cardsInSet };

    fetch('/api/cards/create-set', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res: Response) => {
        console.log(res.status);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  const saveCard = (card: CardBase) => {
    const newCards = cards.slice();
    newCards.push(card);
    setCards(newCards);
  }

  return (
    <div>
      <form>
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
        <button type="button" onClick={createSet}>Create Set</button>
      </form>
    </div>
  )
}