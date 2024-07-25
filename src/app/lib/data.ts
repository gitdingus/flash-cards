'use server';
import { sql, db } from '@vercel/postgres';
import { getUserById } from '@/app/lib/accounts';
import { auth } from '@/auth';
import { isAdmin } from '@/app/lib/permissions';
import { SetRecord, PopulatedSetRecord } from '@/types/set';

export async function getSet(id: string) {
  const client = await db.connect();

  const [ setQuery, cardsQuery, session ] = await Promise.all([
    client.sql`SELECT * FROM set WHERE id = ${id};`,
    client.sql`SELECT * FROM card WHERE inset = ${id};`,
    auth(),
  ]);

  if (setQuery.rows.length === 0) {
    return null;
  }

  const setRecord = setQuery.rows[0];

  if (
    setRecord.hidden === true 
    && setRecord.owner !== session?.user.userId
    && (await isAdmin()) === false) {
    throw new Error('Set has been hidden');
  }

  if (
    setRecord.removed === true
    && (await isAdmin() === false)) {
    throw new Error('Set has been removed');
  }

  const set: SetInfo = {
    id: setRecord.id,
    title: setRecord.name,
    description: setRecord.description,
    dateCreated: setRecord.datecreated,
    owner: setRecord.owner,
    isPublic: setRecord.public,
    lastModified: setRecord.lastmodified,
  }

  const cards: CardBase[] = await Promise.all(cardsQuery.rows.map(async (cardResult) => {
    const linesQuery = await client.sql`SELECT * FROM cardline WHERE cardid = ${cardResult.id}`;
    const lines: Line[] = linesQuery.rows.map((line) => { return { id: line.id, heading: line.heading, content: line.content }});
    const card: CardBase = {
      id: cardResult.id,
      dateCreated: cardResult.datecreated,
      front: { title: cardResult.title },
      back: { lines },
      lastModified: cardResult.lastmodified,
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
  const setQuery = await sql`
      SELECT set.*, users.username
      FROM set
      JOIN users ON users.id = set.owner
      WHERE set.id = ${id}
    ;`;

  if (setQuery.rowCount = 0) {
    return null;
  }

  const setRecord = setQuery.rows[0];
  let set: PopulatedSetRecord = {
    ownerId: setRecord.owner,
    id: setRecord.id,
    name: setRecord.name,
    description: setRecord.description,
    dateCreated: setRecord.datecreated,
    public: setRecord.public,
    lastModified: setRecord.lastmodified,
    hidden: setRecord.hidden,
    ownerUsername: setRecord.username,
    removed: setRecord.removed,
  }

  return set;
}

export async function getAllPublicSets() {
  const result = await sql`
    SELECT * 
    FROM set 
    WHERE public = true
      AND hidden = false
      AND removed = false;
  `; 

  const sets = result.rows.map((set) => {
    const cardSet: SetInfo = {
      id: set.id,
      title: set.name,
      dateCreated: set.datecreated,
      description: set.description,
      isPublic: set.public,
      owner: set.owner,
      lastModified: set.lastmodified,
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
    SELECT * FROM set WHERE owner = ${session?.user.userId} AND removed = false; 
  `;

  const sets = result.rows.map((set) => {
    const cardSet: SetInfo = {
      id: set.id,
      title: set.name,
      dateCreated: set.datecreated,
      description: set.description,
      owner: set.owner,
      isPublic: set.public,
      lastModified: set.lastmodified,
    }

    return cardSet;
  });

  return sets;
}

export async function getUsersPublicSets(userId: string) {
  const setQuery = await sql`
    SELECT * 
    FROM set 
    WHERE owner = ${userId} 
      AND public = true
      AND hidden = false
      AND removed = false 
    ;`;
  const sets: SetInfoBase[] = setQuery.rows.map((setRecord) => {
    const set: SetInfoBase = {
      id: setRecord.id,
      title: setRecord.name,
      description: setRecord.description,
      dateCreated: setRecord.datecreated,
      isPublic: setRecord.public,
      lastModified: setRecord.lastmodified,
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

  let allowedSetsQuery; 
  if (await isAdmin()) {
    allowedSetsQuery = await sql`
      SELECT * FROM set WHERE owner = ${userId};
    `;
  } else {
    allowedSetsQuery = await sql`
      SELECT id, name, description, datecreated, owner, public 
      FROM set 
      WHERE owner = ${userId}
        AND public = true
        AND hidden = false
        AND removed = false
  
      UNION
  
      SELECT set.id, name, description, datecreated, owner, public
      FROM set
      JOIN setpermission
        ON setpermission.setid = set.id
      WHERE 
        owner = ${userId}
        AND hidden = false
        AND removed = false
        AND setpermission.userid = ${session.user.userId}
        AND setpermission.granted = true
      ;
    `;
  }


  const sets: SetInfoBase[] = allowedSetsQuery.rows.map((setRecord) => {
    const set: SetInfoBase = {
      id: setRecord.id,
      title: setRecord.name,
      description: setRecord.description,
      dateCreated: setRecord.datecreated,
      isPublic: setRecord.public,
      lastModified: setRecord.lastmodified,
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

  if (set.ownerId !== session.user.userId) {
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
      AND set.hidden = false
      AND set.removed = false
      AND setpermission.userid = ${session.user.userId}
      AND setpermission.granted = true;
  `;

  return setQuery.rows.map((row) => {
    const set: SetInfo = {
      owner: row.owner,
      id: row.id,
      title: row.name,
      description: row.description,
      dateCreated: row.datecreated,
      isPublic: row.public,
      lastModified: row.lastmodified,
    }

    return set;
  });
}
