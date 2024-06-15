import { Metadata } from 'next';
import SetList from './SetList';
import { getAllPublicSets } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Browse Cards'
}

export default async function ListCards() {
  const sets: SetInfo[] = await getAllPublicSets();

  return (
    <>
      <SetList initialSets={sets} />
    </>
  )
}