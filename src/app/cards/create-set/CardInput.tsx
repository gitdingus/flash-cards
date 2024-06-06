'use client';
import { v4 as uuid } from 'uuid';
import { useState } from 'react';
import LineInput from './LineInput';

interface CardInputProps {
  saveCard: (card: CardBase) => void,
  card?: CardBase,
}

export default function CardInput({ saveCard, card }: CardInputProps) {
  const [ cardTitle, setCardTitle ] = useState(card?.front.title || '');
  const [ lines, setLines ] = useState<Line[]>(card?.back.lines || []);

  const save = () => {
    const newCard: CardBase = {
      id: card?.id || uuid(),
      dateCreated: new Date(),
      front: { title: cardTitle },
      back: { lines }
    }

    saveCard(newCard);

    setCardTitle('');
    setLines([]);
  }

  return (
    <div>
      <div>
        <h3>Front</h3>
        <div>
          <label>
            Title
            <input
              id="cardTitle"
              type="text"
              value={cardTitle}
              onChange={(e) => { setCardTitle(e.target.value) }}
            />
          </label>
        </div>
      </div>
      <div>
        <h3>Back</h3>
        {
          lines.map((line, index) => {
            const lineId = uuid();
            return (
              <LineInput 
                key={lineId} 
                saveLine={(newLine: Line) => {
                  const newLines = lines.slice();
                  newLines.splice(index, 1, newLine);
                  setLines(newLines);
                }} 
                removeLine={(line: Line) => {
                  const newLines = lines.slice();
                  const lineIndex = newLines.findIndex(({heading, content}) => 
                    heading === line.heading && content === line.content
                  );
                  newLines.splice(lineIndex, 1);
                  setLines(newLines);
                }}
                line={line} 
                editMode={false} 
              />
            )
          })
        }
        <LineInput 
          saveLine={(line: Line) => {
            const newLines = lines.slice();
            newLines.push(line);
            setLines(newLines);
          }}
          focusOnSave={true}
        />
      </div>
      <button type="button" onClick={save}>Save Card</button>
    </div>
  )
}