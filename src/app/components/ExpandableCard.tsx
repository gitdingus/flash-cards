'use client';
import { useState } from 'react';

interface Props {
  card: CardRecord,
  children?: React.ReactNode,
}

export default function ExpandableCard({ card, children }: Props) {
  const [ expanded, setExpanded ] = useState(false);
  const [ lines, setLines ] = useState<LineRecord[]>([]);

  const click = () => {
    fetch(`/api/cards/${card.id}`)
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      }).then((data: LineRecord[]) => {
        setLines(data);
      });
    setExpanded(!expanded);
  }

  return (
    <div>
      <button type="button" onClick={click}>{card.title}</button>
      <div className={`card ${expanded ? 'expanded' : ''}`}>
        <ul>
          {
            lines.map((line) => {
              return (
                <li key={`${line.cardId}-${line.heading}`}>
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