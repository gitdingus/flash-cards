'use server';
import { db, sql } from '@vercel/postgres';
import { auth } from '@/auth';

function generateInsertQuery(base: string, numRows: number, numFields: number) {
  const valuesArr = [];
  let nextValues = '';

  for (let i = 0; i <= numRows * numFields; i += 1) {
    if (i % numFields === 0) {
      if (nextValues) {
        valuesArr.push(nextValues);
        nextValues = '';
      }
      nextValues += `($${i+1},`;
    } else if (i % numFields === numFields - 1) {
      nextValues += `$${i+1})`;
    } else {
      nextValues += `$${i+1},`;
    }
  }

  return `${base} ${valuesArr.join(',')};`;
}

function generateInsertCardsValuesArray(cards: CardInSet[]) {
  const values: string[] = [];

  cards.forEach((card) => {
    values.push(card.id, card.inSet, card.dateCreated.toISOString(), card.front.title);
  });

  return values;
}

function generateInsertLinesValuesArray(card: CardInSet) {
  const values: string[] = [];

  card.back.lines.forEach((line) => {
    values.push(line.id, card.id, line.heading, line.content);
  });

  return values;
}

export async function createSet({ set, cardsInSet }: { set: SetInfoBase, cardsInSet: CardInSet[] }, formData: FormData) {
  const [ client, session ] = await Promise.all([
    db.connect(),
    auth(),
  ]);

  if (!session) {
    throw new Error('Unauthorized');
  }

  console.log(set);
  console.log(cardsInSet);
  try {
    await client.query('BEGIN');
    
    console.log('inserting set');
    const insertSetCmd = `
      INSERT INTO set (id, name, description, datecreated, owner, public)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;
    const setData = [set.id, set.title, set.description, set.dateCreated, session.user.userId, set.isPublic];
  
    await client.query(insertSetCmd, setData);
  
    console.log('set inserted');

    const insertCardsBase = `INSERT INTO card(id, inset, datecreated, title) VALUES`;
    const numPropertiesInCard = 4;
    const insertCardsQuery = generateInsertQuery(insertCardsBase, cardsInSet.length, numPropertiesInCard);
    const insertCardsValues = generateInsertCardsValuesArray(cardsInSet);
    
    await client.query(insertCardsQuery, insertCardsValues);
    console.log('inserted cards');
  
    cardsInSet.forEach(async (card: CardInSet) => {
      const insertCardLinesBase = `INSERT INTO cardline (id, cardid, heading, content) VALUES`;
      const numPropertiesInLine = 4;
      const insertCardLinesQuery = generateInsertQuery(insertCardLinesBase, card.back.lines.length, numPropertiesInLine);
      const insertCardLinesValues = generateInsertLinesValuesArray(card);
  
      await client.query(insertCardLinesQuery, insertCardLinesValues);
    });
  
    console.log('inserted cardlines');

    await client.query('COMMIT');
    console.log('committed');
  } catch (err) {
    await client.query('ROLLBACK');
    console.log(err);
  } finally {
    client.release();
  }
}

export async function getCardData(id: string) {
  const cardData = await sql`
    SELECT * FROM cardline WHERE cardid=${id};
  `;
  
  const lines = cardData.rows.map((line) => {
    const newLine: LineRecord = { 
      cardId: line.cardid,
      heading: line.heading,
      content: line.content,
    };

    return newLine;
  })

  return lines;
}

export async function removeLine(line: Line) {
  await sql`DELETE FROM cardline WHERE id = ${line.id};`;
}

export async function editLine(line: Line) {
  await sql`UPDATE cardline SET heading = ${line.heading}, content = ${line.content} WHERE id = ${line.id};`;
}

export async function saveNewLine(line: Line, card: CardBase) {
  await sql`
    INSERT INTO cardline (id, cardid, heading, content)
    VALUES (${line.id}, ${card.id}, ${line.heading}, ${line.content});
  `;
}

export async function saveNewCard(card: CardBase, set: SetInfo) {
  const [client, session] = await Promise.all([
    db.connect(),
    auth(),
  ]);

  if (!session || session.user.userId !== set.owner) {
    throw new Error('Unauthorized');
  }

  const cardInSet: CardInSet = {
    ...card,
    inSet: set.id,
  }

  console.log(cardInSet);
  try {  
    await client.query('BEGIN');

    await client.query(`
      INSERT INTO card (id, inset, datecreated, title) VALUES ($1, $2, $3, $4);`,
      [
        cardInSet.id, 
        cardInSet.inSet, 
        cardInSet.dateCreated, 
        cardInSet.front.title
      ]
    );

    console.log('inserted into card');

    const insertCardLinesBase = `INSERT INTO cardline (id, cardid, heading, content) VALUES`;
    const numPropertiesInLine = 4;
    const insertCardLinesQuery = generateInsertQuery(insertCardLinesBase, cardInSet.back.lines.length, numPropertiesInLine);
    const insertCardLinesValues = generateInsertLinesValuesArray(cardInSet);

    await client.query(insertCardLinesQuery, insertCardLinesValues);

    console.log('inserted lines');
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.log(err);
  } finally {
    client.release();
  }
}

export async function removeCard(card: CardInSet) {
  const [ set, session ] = await Promise.all([
    sql`SELECT * FROM set WHERE id = ${card.inSet}`,
    auth(),
  ]);

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (set.rows.length != 1) {
    throw new Error('Not found');
  }

  if (set.rows[0].owner !== session.user.userId) {
    throw new Error('Forbidden');
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const linesQuery = await sql`SELECT * FROM cardline WHERE cardid = ${card.id};`;
    
    await Promise.all(
      linesQuery.rows.map((line) => 
        client.query(`DELETE FROM cardline WHERE id = $1`, [line.id])
      ),
    );

    await client.query(`DELETE FROM card WHERE id = $1`, [card.id]);

    await client.query('COMMIT');
  } catch (err) {
    console.log(err);
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

export async function editCardTitle(card: CardInSet) {
  const [ set, session ] = await Promise.all([
    sql`SELECT * FROM set WHERE id = ${card.inSet}`,
    auth(),
  ]);

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (set.rows.length != 1) {
    throw new Error('Not found');
  }

  if (set.rows[0].owner !== session.user.userId) {
    throw new Error('Forbidden');
  }

  await sql`UPDATE card SET title = ${card.front.title} WHERE id = ${card.id}`;
}

export async function updateSetInformation(set: SetInfoBase) {
  console.log(set);
  const [ setOwner, session ] = await Promise.all([
    sql`SELECT owner FROM set WHERE id = ${set.id};`,
    auth(),
  ]);

  console.log(setOwner);
  if (!session) {
    throw new Error('Unauthorized');
  }

  if (setOwner.rows.length !== 1) {
    throw new Error('Not found');
  }

  if (session.user.userId != setOwner.rows[0].owner) {
    throw new Error('Forbidden');
  }

  await sql`UPDATE set SET name = ${set.title}, description = ${set.description}, public = ${set.isPublic} WHERE id = ${set.id};`;

}