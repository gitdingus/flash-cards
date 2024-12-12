import { auth } from '@/auth';
import { getUser } from "@/app/lib/accounts";
import { getAllowedSetsFromUser } from "@/app/lib/data";
import SetFooter from './SetFooter';
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
            <h2><a href={`/set/${set.id}`}>{set.title}</a></h2>
            <p><span>{set.description}</span><span className={styles.cardCount}>{set.cardCount} {set.cardCount > 1 ? "cards": "card"}</span></p>
            <SetFooter set={set} ownSet={ownProfile} loggedIn={!!session?.user} />
            </div>
          ))
        }
      </div>
    </div>
  )
}

