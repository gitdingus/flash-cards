import { Metadata } from 'next';
import { getSets } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Browse Cards'
}

export default async function ListCards() {
  const sets: CardSet[] = await getSets();

  return (
    <>
      <h1>Sets</h1>
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
    </>
  )
}