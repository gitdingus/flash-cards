import { sql } from '@vercel/postgres';
import { getSet } from '@/app/lib/data';
import { getUserById } from '@/app/lib/accounts';
import { auth } from '@/auth';
import ExpandableCard from '@/app/components/ExpandableCard';

export default async function SetInfo({ params }: { params: { id: string } }) {
  const [set, session] = await Promise.all([
    getSet(params.id),
    auth(),
  ])

  if (!set) {
    return <div>Not Found</div>
  }
  
  const owner = await getUserById(set.owner);

  return (
    <div>
      <h1>Set</h1>
      <p>{set.title}</p>
      <p>{set.description}</p>
      {
        owner &&
        <p>Created by: <span>{owner.username}</span></p>
      }
      {
        session?.user.userId === set.owner && 
        <a href={`/set/${set.id}/edit`}>Edit Set</a>
      }
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