import { Metadata } from 'next';
import { QueryResultRow, sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';

export const metadata: Metadata = {
  title: 'Browse Cards'
}

async function getSets() {
  const result = await sql`
    SELECT * FROM set;
  `; 

  return result.rows;
}

export default async function ListCards() {
  noStore();
  const sets = await getSets();

  return (
    <>
      <h1>Sets</h1>
      {
        sets.map((set: QueryResultRow) => {
          const currentSet: CardSet = {
            id: set.id,
            title: set.name,
            dateCreated: set.datecreated,
            description: set.description,
          }

          return (
            <div key={currentSet.id}>
              <p><a href={`/set/${currentSet.id}`}>{currentSet.title}</a><span>{currentSet.dateCreated.toLocaleString()}</span></p>
              <div>
                <p>{currentSet.description}</p>
              </div>
            </div>
          )
        })
      }
    </>
  )
}