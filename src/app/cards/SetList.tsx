'use client';
import { useRef, useState } from 'react';
import { populateSets } from '../lib/data';

interface SetListProps {
  initialSets: SetInfo[],
}

export default function SetList({ initialSets }: SetListProps) {
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
          <label>
            <input 
              type="radio" 
              name="set-type" 
              value="private" 
              onClick={(e) => { form.current?.requestSubmit() }}
            />
            Private
          </label>
          <label>
            <input
              type="radio" 
              name="set-type" 
              value="own" 
              onClick={(e) => { form.current?.requestSubmit() }}
            />
            My sets
          </label>
        </fieldset>
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