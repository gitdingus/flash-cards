'use client';
import { useEffect, useState } from 'react';
import { getCardData } from '@/actions/card-actions';

interface Props {
  card: CardBase,
  children?: React.ReactNode,
}

export default function ExpandableCard({ card, children }: Props) {
  const [ expanded, setExpanded ] = useState(false);

  const click = () => {
    setExpanded(!expanded);
  }

  return (
    <div>
      <button type="button" onClick={click}>{card.front.title}</button>
      <div className={`card ${expanded ? 'expanded' : ''}`}>
        <ul>
          {
            card.back.lines.map((line) => {
              return (
                <li key={`${card.id}-${line.heading}`}>
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