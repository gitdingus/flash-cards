import { auth } from '@/auth';
import { getUser } from "@/app/lib/accounts";
import { getAllowedSetsFromUser } from "@/app/lib/data";
import SetPermissions from '@/app/components/set-tools/SetPermissions';
import CreateReport from '@/app/components/report/CreateReport';
import styles from '@/app/styles/user/user-layout.module.css';
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
      <div className={styles.sets}>
        {
          sets.map((set) => (
            <div key={set.id} className={styles.set}>
              <p>
                <span><a href={`/set/${set.id}`}>{set.title}</a>:</span> <span>{set.description}</span>
              </p>
              {
                ownProfile &&
                <SetPermissions
                  set={set}
                />
              }
              {
                session?.user &&
                <CreateReport setId={set.id} />
              }
            </div>
          ))
        }
      </div>
    </div>
  )


}