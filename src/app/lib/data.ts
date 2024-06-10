'use server';
import { sql, db } from '@vercel/postgres';
import { auth } from '@/auth';

export async function getSet(id: string) {
  const client = await db.connect();

  const [ setQuery, cardsQuery ] = await Promise.all([
    client.sql`SELECT * FROM set WHERE id = ${id};`,
    client.sql`SELECT * FROM card WHERE inset = ${id};`
  ]);

  if (setQuery.rows.length === 0) {
    return null;
  }

  const setRecord = setQuery.rows[0];
  const set: SetInfo = {
    id: setRecord.id,
    title: setRecord.name,
    description: setRecord.description,
    dateCreated: setRecord.datecreated,
    owner: setRecord.owner,
    isPublic: setRecord.public,
  }

  const cards: CardBase[] = await Promise.all(cardsQuery.rows.map(async (cardResult) => {
    const linesQuery = await client.sql`SELECT * FROM cardline WHERE cardid = ${cardResult.id}`;
    const lines: Line[] = linesQuery.rows.map((line) => { return { heading: line.heading, content: line.content }});
    const card: CardBase = {
      id: cardResult.id,
      dateCreated: cardResult.datecreated,
      front: { title: cardResult.title },
      back: { lines },
    }
    
    return card;
  }));

  client.release();
  
  const setOfCards: SetOfCards = {
    ...set,
    cards,
  }

  return setOfCards;
}

export async function getSets() {
  const result = await sql`
    SELECT * FROM set WHERE public = 'true';
  `; 

  const sets = result.rows.map((set) => {
    const cardSet: SetInfo = {
      id: set.id,
      title: set.name,
      dateCreated: set.datecreated,
      description: set.description,
      isPublic: set.public,
      owner: set.owner,
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
    const cardSet: SetInfo = {
      id: set.id,
      title: set.name,
      dateCreated: set.datecreated,
      description: set.description,
      owner: set.owner,
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