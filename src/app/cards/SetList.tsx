'use client';
import { useEffect, useState } from 'react';
import { populateSets } from '../lib/data';

interface SetListProps {
  initialSets: CardSet[],
}

export default function SetList({ initialSets }: SetListProps) {
  const [ sets, setSets ] = useState<CardSet[]>(initialSets);
  const [ showOwnSets, setShowOwnSets ] = useState(false);

  useEffect(() => {
    populateSets(showOwnSets)
      .then((sets) => {
        setSets(sets);
      });
  }, [showOwnSets]);

  return (
    <div>
      <h1>Sets</h1>
      <form>
        <label>
          Show only my Sets
          <input type="checkbox" name="showOwnSets" checked={showOwnSets} onChange={(e) => {
            setShowOwnSets(!showOwnSets);
          }} />
        </label>
      </form>
      {
        sets.map((set) => {
          return (
            <div key={set.id}>
              <p><a href={`/set/${set.id}`}>{set.title}</a><span>{set.dateCreated.toLocaleString()}</span></p>
              <div>
                <p>{set.description}</p>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}