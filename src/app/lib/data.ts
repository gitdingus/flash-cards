'use server';
import { sql, db } from '@vercel/postgres';
import { getUserById } from '@/app/lib/accounts';
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
    const lines: Line[] = linesQuery.rows.map((line) => { return { id: line.id, heading: line.heading, content: line.content }});
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

export async function getSetInfo(id: string) {
  const setQuery = await sql`SELECT * FROM set WHERE id = ${id}`;

  if (setQuery.rowCount = 0) {
    return null;
  }

  const setRecord = setQuery.rows[0];
  const set: SetInfo = {
    owner: setRecord.owner,
    id: setRecord.id,
    title: setRecord.name,
    description: setRecord.description,
    dateCreated: setRecord.datecreated,
    isPublic: setRecord.public,
  }

  return set;
}

export async function getAllPublicSets() {
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

export async function getUsersPublicSets(userId: string) {
  const setQuery = await sql`SELECT * FROM set WHERE owner = ${userId} AND public = true;`;
  const sets: SetInfoBase[] = setQuery.rows.map((setRecord) => {
    const set: SetInfoBase = {
      id: setRecord.id,
      title: setRecord.name,
      description: setRecord.description,
      dateCreated: setRecord.datecreated,
      isPublic: setRecord.public,
    }

    return set;
  });

  return sets;
}

export async function getAllowedSetsFromUser(userId: string) {
  //returns all public sets and sets that logged in user is allowed to see
  const session = await auth();

  if (!session) {
    return getUsersPublicSets(userId);
  }

  if (session.user.userId === userId) {
    return getOwnSets();
  }

  const allowedSetsQuery = await sql`
    SELECT * 
    FROM set 
    WHERE owner = ${userId}
      AND public = true

    UNION

    SELECT set.id, name, description, datecreated, owner, public
    FROM set
    JOIN setpermission
      ON setpermission.setid = set.id
    WHERE 
      owner = ${userId}
      AND setpermission.userid = ${session.user.userId}
      AND setpermission.granted = true
    ;
  `;

  const sets: SetInfoBase[] = allowedSetsQuery.rows.map((setRecord) => {
    const set: SetInfoBase = {
      id: setRecord.id,
      title: setRecord.name,
      description: setRecord.description,
      dateCreated: setRecord.datecreated,
      isPublic: setRecord.public,
    };

    return set;
  });

  return sets;
}

export async function getAllowedUsersOfSet(setId: string) {
  const [ set, session ] = await Promise.all([
    getSetInfo(setId),
    auth(),
  ]);

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (!set) {
    throw new Error('Not found');
  }

  if (set.owner !== session.user.userId) {
    throw new Error('Forbidden');
  }

  const allowedUsersQuery = await sql`
    SELECT * FROM setpermission WHERE setid = ${setId};
  `;

  if (allowedUsersQuery.rowCount === 0) {
    return [];
  }

  const users = await Promise.all(allowedUsersQuery.rows.map((user) => {
    return getUserById(user.userid);
  }));

  return users;
}

export async function populateSets(formData: FormData) {
  const setType = formData.get('set-type') as string;

  switch (setType) {
    case 'own':
      return await getOwnSets();
    case 'private': 
      return await getAllowedPrivateSets();
    case 'public':
    default: 
      return await getAllPublicSets();
  }
}

async function getAllowedPrivateSets() {
  const [ session ] = await Promise.all([
    auth(),
  ]);

  if (!session) {
    throw new Error('Unauthorized');
  }

  const setQuery = await sql`
    SELECT *
    FROM setpermission
    JOIN set
      ON set.id = setpermission.setid
    WHERE set.public = false
      AND setpermission.userid = ${session.user.userId}
      AND setpermission.granted = true;
  `;

  console.log(setQuery);
  return setQuery.rows.map((row) => {
    const set: SetInfo = {
      owner: row.owner,
      id: row.id,
      title: row.name,
      description: row.description,
      dateCreated: row.datecreated,
      isPublic: row.public,
    }

    return set;
  });
}
