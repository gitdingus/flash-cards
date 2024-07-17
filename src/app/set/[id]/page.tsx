import { sql } from '@vercel/postgres';
import { getSet } from '@/app/lib/data';
import { getUserById } from '@/app/lib/accounts';
import { auth } from '@/auth';
import { hasAccessToSet } from '@/app/lib/permissions';
import ExpandableCard from '@/app/components/ExpandableCard';
import CreateReport from '@/app/components/report/CreateReport';
export default async function SetInfo({ params }: { params: { id: string } }) {
  let set;
  let session;
  try {  
    [set, session] = await Promise.all([
      getSet(params.id),
      auth(),
    ]);
  } catch (err) {
    return <p>There has been a problem with your request.</p>
  }

  if (!set) {
    return <div>Not Found</div>
  }
  
  const owner = await getUserById(set.owner);

  if (set.isPublic === false) {
    if (!session || !(await hasAccessToSet(set.owner, session.user.userId, set.id))) {
      return <div>Not allowed</div>
    }
  }

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
        session?.user &&
        <CreateReport setId={set.id} />
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