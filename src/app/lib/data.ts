'use server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';

export async function getSets() {
  const result = await sql`
    SELECT * FROM set WHERE public = 'true';
  `; 

  const sets = result.rows.map((set) => {
    const cardSet: CardSet = {
      id: set.id,
      title: set.name,
      dateCreated: set.datecreated,
      description: set.description,
      isPublic: set.public,
    }

    return cardSet;
  });

  return sets;
}

export async function getOwnSets() {
  const session = await auth();

  if (!session) {
    throw new Error('Forbidden');
  }

  const result = await sql`
    SELECT * FROM set WHERE owner = ${session?.user.userId}; 
  `;

  const sets = result.rows.map((set) => {
    const cardSet: CardSet = {
      id: set.id,
      title: set.name,
      dateCreated: set.datecreated,
      description: set.description,
      isPublic: set.public,
    }

    return cardSet;
  });

  return sets;
}

export async function populateSets(showOwnSets: boolean) {
  switch (showOwnSets) {
    case true: 
      return await getOwnSets();
    default:
      return await getSets();
  }
}