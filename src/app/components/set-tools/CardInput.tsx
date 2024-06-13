'use client';
import { v4 as uuid } from 'uuid';
import { useState } from 'react';
import LineInput from './LineInput';

interface CardInputProps {
  card?: CardBase,
  saveCard: (card: CardBase) => void,
  saveLine?: (line: Line, card: CardBase) => void,
  editLine?: (line: Line) => void,
  removeLine?: (line: Line) => void,
}

export default function CardInput({ card, saveCard, saveLine, editLine, removeLine }: CardInputProps) {
  const [ cardTitle, setCardTitle ] = useState(card?.front.title || '');
  const [ lines, setLines ] = useState<Line[]>(card?.back.lines || []);

  const save = () => {
    const newCard: CardBase = {
      id: card?.id || uuid(),
      dateCreated: card?.dateCreated || new Date(),
      front: { title: cardTitle },
      back: { lines }
    }

    saveCard(newCard);

    setCardTitle('');
    setLines([]);
  }

  const defaultSaveLine = (line: Line) => {
    const newLines = lines.slice();
    newLines.push(line);
    setLines(newLines);
  }

  const defaultEditLine = (newLine: Line) => {
    const newLines = lines.slice();
    const lineIndex = newLines.findIndex((line) => line.id === newLine.id);
    newLines.splice(lineIndex, 1, newLine);
    setLines(newLines);
  }

  const defaultRemoveLine = (removeLine: Line) => {
    const newLines = lines.slice();
    const lineIndex = newLines.findIndex((line) => line.id === removeLine.id);
    newLines.splice(lineIndex, 1);
    setLines(newLines);
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
            return (
              <LineInput 
                key={line.id} 
                saveLine={(line: Line) => {
                  defaultSaveLine(line)
                  if (card && saveLine) {
                    saveLine(line, card);
                  }
                }}
                editLine={(line: Line) => {
                  defaultEditLine(line);
                  if (editLine) {
                    editLine(line);
                  }
                }} 
                removeLine={(line: Line) => {
                  defaultRemoveLine(line);
                  if (removeLine) {
                    removeLine(line);
                  }
                }}
                line={line} 
                editMode={false} 
              />
            )
          })
        }
        <LineInput 
          saveLine={(line: Line) => {
            defaultSaveLine(line);
            if (card && saveLine) {
              saveLine(line, card);
            }
          }}
          focusOnSave={true}
        />
      </div>
      <button type="button" onClick={save}>Save Card</button>
    </div>
  )
}