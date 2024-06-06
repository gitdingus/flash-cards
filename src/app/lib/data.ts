'use server';
import { sql } from '@vercel/postgres';
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