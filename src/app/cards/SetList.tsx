'use client';
import { useContext, useRef, useState } from 'react';
import { populateSets } from '../lib/data';
import { SessionContext } from '@/app/context/SessionContext';
import styles from '@/app/styles/cards/set-list.module.css';

interface SetListProps {
  initialSets: SetInfo[],
}

export default function SetList({ initialSets }: SetListProps) {
  const session = useContext(SessionContext);
  const [ sets, setSets ] = useState<SetInfo[]>(initialSets);
  const form = useRef<HTMLFormElement>(null);

  return (
    <div>
      <h1>Sets</h1>
      <form 
        ref={form}
        action={async (formData: FormData) => {
          setSets(await populateSets(formData));
        }}
      >
        <fieldset>
          <legend>View sets</legend>
          <label>
            <input 
              type="radio" 
              name="set-type" 
              value="public" 
              onClick={(e) => { form.current?.requestSubmit() }}
              defaultChecked/>
            Public
          </label>
          {
            session?.user &&
            <label>
              <input 
                type="radio" 
                name="set-type" 
                value="private" 
                onClick={(e) => { form.current?.requestSubmit() }}
              />
              Private
            </label>
          }
          {
            session?.user &&
            <label>
              <input
                type="radio" 
                name="set-type" 
                value="own" 
                onClick={(e) => { form.current?.requestSubmit() }}
              />
              My sets
            </label>
          }
        </fieldset>
      </form>
      <div className={`${styles.setList}`}>
        {
          sets.map((set) => <SetThumb key={set.id} set={set} />)
        }
      </div>
    </div>
  )
}

function SetThumb({ set }: { set: SetInfo }) {
  return (
    <div className={`${styles.setThumb}`}>
      <h2>{set.title}</h2>
      <p>{set.description}</p>
      <p><a href={`/set/${set.id}`}>View</a></p>
    </div>
  )
}