import { sql } from '@vercel/postgres';
import { getSet } from '@/app/lib/data';
import { auth } from '@/auth';
import { hasAccessToSet } from '@/app/lib/permissions';
import CardGallery from '@/app/components/set-display/CardGallery';
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
  
  if (set.isPublic === false) {
    if (!session || !(await hasAccessToSet(set.owner, session.user.userId, set.id))) {
      return <div>Not allowed</div>
    }
  }

  return (
    <div>
      <h1>{set.title}</h1>
      <p>{set.description}</p>
      {
        set.ownerUsername &&
        <p>Created by: <span><a href={`/user/${set.ownerUsername}`}>{set.ownerUsername}</a></span></p>
      }
      {
        session?.user &&
        <CreateReport setId={set.id} />
      }
      {
        session?.user.userId === set.owner && 
        <a href={`/set/${set.id}/edit`}>Edit Set</a>
      }
      <CardGallery cards={set.cards} />
    </div>
  )
}