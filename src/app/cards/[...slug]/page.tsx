import { getAllPublicSets, getAllowedPrivateSets, getOwnSets, SetInfoQueryConfig } from '@/app/lib/data';
import Link from 'next/link';
import styles from '@/app/styles/cards/card-list.module.css';

interface Props {
  params: {
    slug: string[]
  },
  searchParams: {
    [index: string]: string,
  } 
}
export default async function Sets({ params: { slug }, searchParams}: Props) {
  let queryFn: (params?: SetInfoQueryConfig) => Promise<SetInfo[]>;
  let title: string;
  const queryOptions: SetInfoQueryConfig = {};
  const QUERY_LIMIT = 10;
  queryOptions.limit = QUERY_LIMIT;

  if (slug.length !== 1) {
    return <p>Not found</p>
  }

  if (searchParams.page !== undefined) {
    queryOptions.offset = Number.parseInt(searchParams.page) * queryOptions.limit;
  }

  const path = slug[0];
  switch (path) {
    case "public": 
      queryFn = getAllPublicSets;
      title = "Public Sets";
      break;
    case "private":
      queryFn = getAllowedPrivateSets;
      title = "Private Sets";
      break;
    case "mine":
      queryFn = getOwnSets;
      title = "My Sets";
      break;
    default:
      return <p>Not found</p>
  }

  const sets = await queryFn(queryOptions);

  return (
    <div>
      <h1>{title}</h1>
      {
        sets.map(set => (
          <SetDisplay key={set.id} set={set} />
        ))
      }
      <div className={styles.navLinks}>
        {
          (searchParams?.page !== undefined && Number.parseInt(searchParams.page) > 0)
          &&
          <Link href={`/cards/${path}?page=${Number.parseInt(searchParams.page) - 1}`}>Prev</Link>
        }
        {
          sets.length >= QUERY_LIMIT
          &&
          <Link href={`/cards/${path}?page=${(Number.parseInt(searchParams.page) || 0) + 1}`}>Next</Link>
        }
      </div>
    </div>
  )
}

interface SetDisplayProps {
  set: SetInfo,
}

function SetDisplay({ set }: SetDisplayProps) {
  return (
    <div className={styles.setDisplay}>
      <h2><Link href={`/set/${set.id}`}>{set.title}</Link></h2>
      <p>{set.description}</p>
      <p>Created by <Link href={`/user/${set.ownerUsername}`}>{set.ownerUsername}</Link> on {set.dateCreated.toLocaleDateString()} with {set.cardCount} cards</p>
    </div>
  )
}