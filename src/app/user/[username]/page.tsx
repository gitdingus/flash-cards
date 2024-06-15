import { auth } from '@/auth';
import { getUser } from "@/app/lib/accounts";
import { getAllowedSetsFromUser } from "@/app/lib/data";
import SetPermissions from '@/app/components/set-tools/SetPermissions';
interface UserParams {
  params: {
    username: string,
  }
}

export default async function User({ params : { username }}: UserParams) {
  const [ session, user ]  = await Promise.all([
    auth(),
    getUser(username),
  ]); 

  if (!user) {
    return <div>Not found</div>
  }

  const sets = await getAllowedSetsFromUser(user.id);
  const ownProfile = session?.user.userId === user.id;
  return (
    <div>
      <h1>{`${user.username}'s Profile`}</h1>
      <div>
        <ul>
          {
            sets.map((set) => (
              <li key={set.id}>
                <div>
                  <p>
                    <span><a href={`/set/${set.id}`}>{set.title}</a>:</span> <span>{set.description}</span>
                  </p>
                  <SetPermissions 
                    set={set} 
                    allowedUsers={[]} 
                  />
                </div>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  )


}