import { sql } from '@vercel/postgres';
import { getSet } from '@/app/lib/data';
import ExpandableCard from '@/app/components/ExpandableCard';

export default async function SetInfo({ params }: { params: { id: string } }) {
  const set = await getSet(params.id);

  if (!set) {
    return <div>Not Found</div>
  }

  return (
    <div>
      <h1>Set</h1>
      <p>{set.title}</p>
      <p>{set.description}</p>
      <ul>
        {
          set.cards.map((card) => {
            return(
              <li key={card.id}>
                <ExpandableCard card={card} />
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}