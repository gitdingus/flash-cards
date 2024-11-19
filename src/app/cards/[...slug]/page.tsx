import { getAllPublicSets, getAllowedPrivateSets, getOwnSets, SetInfoQueryConfig } from '@/app/lib/data';
import Link from 'next/link';

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
      <h2>{title}</h2>
      {
        sets.map(set => (
          <div key={set.id}>
            <h2><Link href={`/set/${set.id}`}>{set.title}</Link></h2>
            <p>{set.description}</p>
            <p><Link href={`/user/${set.ownerUsername}`}>{set.ownerUsername}</Link></p>
            <p>{set.cardCount} card(s)</p>
          </div>
        ))
      }
      {
        sets.length >= QUERY_LIMIT
        &&
        <Link href={`/cards/${path}?page=${(Number.parseInt(searchParams.page) || 0) + 1}`}>Next</Link>
      }
      {
        (searchParams?.page !== undefined && Number.parseInt(searchParams.page) > 0)
        &&
        <Link href={`/cards/${path}?page=${Number.parseInt(searchParams.page) - 1}`}>Prev</Link>
      }
    </div>
  )
}