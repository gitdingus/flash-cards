'use client';
import { useEffect, useState } from 'react';
import { getCardData } from '@/actions/card-actions';

interface Props {
  card: CardRecord,
  children?: React.ReactNode,
}

export default function ExpandableCard({ card, children }: Props) {
  const [ expanded, setExpanded ] = useState(false);
  const [ lines, setLines ] = useState<LineRecord[]>([]);

  useEffect(() => {
    const getIt = async () => {
      const gotLines = await getCardData(card.id);
      setLines(gotLines);
    };

    getIt();

  }, [card.id]);

  const click = () => {
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