import { Metadata } from 'next';
import SetList from './SetList';
import { getSets, getOwnSets } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Browse Cards'
}

export default async function ListCards() {
  const sets: SetInfo[] = await getSets();

  return (
    <>
      <SetList initialSets={sets} />
    </>
  )
}