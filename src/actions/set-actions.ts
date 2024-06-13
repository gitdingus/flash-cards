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
    values.push(card.id, line.heading, line.content);
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
      const insertCardLinesBase = `INSERT INTO cardline (cardid, heading, content) VALUES`;
      const numPropertiesInLine = 3;
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