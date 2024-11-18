import { getAllPublicSets, getAllowedPrivateSets, getOwnSets } from '@/app/lib/data';

interface Props {
  params: {
    slug: string[],
    searchParams: {
      [index: string]: string,
    },
  }
}
export default async function Sets({ params: { slug, searchParams }}: Props) {
  let queryFn;

  if (slug.length !== 1) {
    return <p>Not found</p>
  }

  const path = slug[0];
  switch (path) {
    case "public": 
      queryFn = getAllPublicSets;
      break;
    case "private":
      queryFn = getAllowedPrivateSets;
      break;
    case "mine":
      queryFn = getOwnSets;
      break;
    default:
      return <p>Not Found</p>
  }

  const sets = await queryFn();

  console.log(sets);
  return <p>Hello Cards</p>
}