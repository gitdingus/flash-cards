import { sql } from '@vercel/postgres';
import ExpandableCard from '@/app/components/ExpandableCard';

export default async function SetInfo({ params }: { params: { id: string } }) {
  console.log(params.id);
  const set = await sql`
    SELECT * FROM set WHERE id = ${params.id};
  `;

  const cards = await sql`
    SELECT * FROM card WHERE inset = ${params.id};
  `;

  console.log(set.rows);
  console.log(cards.rows);
  return (
    <div>
      <h1>Set</h1>
      <p>{set.rows[0].name}</p>
      <p>{set.rows[0].description}</p>
      <ul>
        {
          cards.rows.map((card) => {
            const currentCard: CardRecord = {
              id: card.id,
              inSet: card.inset,
              dateCreated: new Date(card.datecreated),
              title: card.title,
            }
            return(
              <li key={card.id}>
                <ExpandableCard card={currentCard} />
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}