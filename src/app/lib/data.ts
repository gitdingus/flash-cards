'use server';
import { sql, db } from '@vercel/postgres';
import { getUserById } from '@/app/lib/accounts';
import { auth } from '@/auth';
import { isAdmin } from '@/app/lib/permissions';
import { SetRecord, PopulatedSetRecord } from '@/types/set';

export async function getSet(id: string) {
  const client = await db.connect();

  const [ setQuery, cardsQuery, session ] = await Promise.all([
    client.sql`
      SELECT set.*, users.username AS owner_username
      FROM set 
        JOIN users ON (users.id = set.owner)
      WHERE set.id = ${id};
    `,
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

  const set: SetInfo = {
    id: setRecord.id,
    title: setRecord.name,
    description: setRecord.description,
    dateCreated: setRecord.datecreated,
    owner: setRecord.owner,
    ownerUsername: setRecord.owner_username,
    isPublic: setRecord.public,
    lastModified: setRecord.lastmodified,
    cardCount: cards.length,
  }

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

type SetColumns = "datecreated" | "set.datecreated";
type SortDirection = "ASC" | "DESC";

export interface SetInfoQueryConfig {
  limit?: number,
  offset?: number,
  sort?: {
    column?: SetColumns,
    direction?: SortDirection,
  },
}

const defaultSetInfoQueryConfig: SetInfoQueryConfig = {
  limit: 10,
  offset: 0,
  sort: {
    column: 'datecreated',
    direction: 'DESC'
  }
}

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;
const DEFAULT_SORT_COLUMN = 'set.datecreated';
const DEFAULT_SORT_DIRECTION = 'DESC';

export async function getAllPublicSets(params?: SetInfoQueryConfig) {

  const config: SetInfoQueryConfig = {};
  config.limit = params?.limit || DEFAULT_LIMIT;
  config.offset = params?.offset || DEFAULT_OFFSET;
  config.sort = {};

  switch (params?.sort?.column) {
    case "datecreated":
    default: 
      config.sort.column = DEFAULT_SORT_COLUMN;
  }
  config.sort.direction = params?.sort?.direction || DEFAULT_SORT_DIRECTION;

  const client = await db.connect();

  const queryArgs = [config.limit, config.offset];
  const queryString = `
    SELECT set.*, users.username AS owner_username, count(card.inset) AS card_count
    FROM set 
      JOIN users ON (users.id = set.owner)
      JOIN card ON (set.id = card.inset)
    WHERE public = true
      AND hidden = false
      AND removed = false
    GROUP BY set.id, users.username
    ORDER BY ${config.sort.column} ${config.sort.direction === "ASC" ? "ASC" : "DESC"}
    LIMIT $1
    OFFSET $2
    ;
  `;

  const query = await client.query(queryString, queryArgs);

  const sets = query.rows.map((set) => {
    const cardSet: SetInfo = {
      id: set.id,
      title: set.name,
      dateCreated: set.datecreated,
      description: set.description,
      isPublic: set.public,
      owner: set.owner,
      ownerUsername: set.owner_username,
      cardCount: set.card_count,
      lastModified: set.lastmodified,
    }

    return cardSet;
  });

  return sets;
}

export async function getOwnSets(params?: SetInfoQueryConfig) {
  const session = await auth();

  if (!session || !session.user.userId) {
    throw new Error('Forbidden');
  }

  const config: SetInfoQueryConfig = {};
  config.limit = params?.limit || DEFAULT_LIMIT;
  config.offset = params?.offset || DEFAULT_OFFSET;
  config.sort = {};
  
  switch (params?.sort?.column) {
    case "datecreated":
    default:
      config.sort.column = DEFAULT_SORT_COLUMN;
  }

  config.sort.direction = params?.sort?.direction || DEFAULT_SORT_DIRECTION;

  const queryParams = [session.user.userId, config.limit, config.offset];

  const queryString = `
    SELECT set.*, COUNT(card.inset) AS card_count
    FROM set 
    JOIN card ON (set.id = card.inset)
    WHERE owner = $1
      AND removed = false
    GROUP BY set.id
    ORDER BY ${config.sort.column} ${config.sort.direction === "ASC" ? "ASC" : "DESC"}
    LIMIT $2
    OFFSET $3
    ;
  `;

  const client = await db.connect();
  const query = await client.query(queryString, queryParams);

  const sets = query.rows.map((set) => {
    const cardSet: SetInfo = {
      id: set.id,
      title: set.name,
      dateCreated: set.datecreated,
      description: set.description,
      owner: set.owner,
      ownerUsername: session.user.username,
      isPublic: set.public,
      cardCount: set.card_count,
      lastModified: set.lastmodified,
    }

    return cardSet;
  });

  return sets;
}

export async function getUsersPublicSets(userId: string) {
  const setQuery = await sql`
    SELECT set.*, users.username, COUNT(card.inset) as card_count 
    FROM set 
    JOIN users ON (users.id = set.owner)
    JOIN card ON (card.inset = set.id)
    WHERE owner = ${userId} 
      AND public = true
      AND hidden = false
      AND removed = false 
    GROUP BY set.id, users.username
    ;`;
  const sets: SetInfo[] = setQuery.rows.map((setRecord) => {
    const set: SetInfo = {
      id: setRecord.id,
      title: setRecord.name,
      description: setRecord.description,
      dateCreated: setRecord.datecreated,
      isPublic: setRecord.public,
      lastModified: setRecord.lastmodified,
      owner: setRecord.owner,
      ownerUsername: setRecord.username,
      cardCount: setRecord.card_count,
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
      SELECT set.*, users.username, COUNT(card.inset) as card_count
      FROM set
      JOIN users ON (users.id = set.owner) 
      JOIN card ON (card.inset = set.id)
      WHERE owner = ${userId}
      GROUP BY set.id, users.username
    ;`;
  } else {
    allowedSetsQuery = await sql`
      SELECT set.*, users.username, COUNT(card.inset) as card_count
      FROM set 
      JOIN users ON (users.id = set.owner)
      JOIN card ON (card.inset = set.id)
      WHERE owner = ${userId}
        AND public = true
        AND hidden = false
        AND removed = false
      GROUP BY set.id, users.username

      UNION
      
      SELECT set.*, users.username, COUNT(card.inset) as card_count
      FROM set
      JOIN setpermission
        ON (setpermission.setid = set.id)
      JOIN users ON (users.id = set.owner)
      JOIN card ON (card.inset = set.id)
      WHERE 
        owner = ${userId}
        AND hidden = false
        AND removed = false
        AND setpermission.userid = ${session.user.userId}
        AND setpermission.granted = true
      GROUP BY set.id, users.username
    ;`;
  }

  

  const sets: SetInfo[] = allowedSetsQuery.rows.map((setRecord) => {
    const set: SetInfo = {
      id: setRecord.id,
      title: setRecord.name,
      description: setRecord.description,
      dateCreated: setRecord.datecreated,
      isPublic: setRecord.public,
      lastModified: setRecord.lastmodified,
      owner: setRecord.owner,
      ownerUsername: setRecord.username,
      cardCount: setRecord.card_count,
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

export async function getAllowedPrivateSets(params?: SetInfoQueryConfig) {
  const [ session ] = await Promise.all([
    auth(),
  ]);

  if (!session) {
    throw new Error('Unauthorized');
  }
  const config: SetInfoQueryConfig = {};
  config.limit = params?.limit || DEFAULT_LIMIT;
  config.offset = params?.offset || DEFAULT_OFFSET;
  config.sort = {};

  switch (params?.sort?.column) {
    case 'datecreated':
    default:
      config.sort.column = DEFAULT_SORT_COLUMN;
  }

  config.sort.direction = params?.sort?.direction === "ASC" ? "ASC" : "DESC";

  const queryArgs = [session.user.userId, config.limit, config.offset];
  const queryString = `
    SELECT set.*, users.username AS owner_username, COUNT(card.inset) AS card_count
    FROM setpermission
    JOIN set
      ON set.id = setpermission.setid
    JOIN users
      ON set.owner = users.id
    JOIN card
      ON set.id = card.inset
    WHERE set.public = false
      AND set.hidden = false
      AND set.removed = false
      AND setpermission.userid = $1
      AND setpermission.granted = true
    GROUP BY set.id, users.username
    ORDER BY ${config.sort.column} ${config.sort.direction}
    LIMIT $2
    OFFSET $3
    ;
  `;

  const client = await db.connect();
  const query = await client.query(queryString, queryArgs);

  return query.rows.map((row) => {
    const set: SetInfo = {
      owner: row.owner,
      ownerUsername: row.owner_username,
      id: row.id,
      title: row.name,
      description: row.description,
      dateCreated: row.datecreated,
      isPublic: row.public,
      cardCount: row.card_count,
      lastModified: row.lastmodified,
    }

    return set;
  });
}
