import { db } from '@vercel/postgres';

function generateInsertQuery(base: string, numCards: number, numFields: number) {
  const valuesArr = [];
  let nextValues = '';

  for (let i = 0; i <= numCards * numFields; i += 1) {
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
    values.push(card.id, card.inSet, card.dateCreated.toString(), card.front.title);
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

export async function POST(req: Request) {
  const data = await req.json();
  const client = await db.connect();
  await client.query('BEGIN');

  try {
    const insertSetCmd = `
      INSERT INTO set (id, name, description, datecreated)
      VALUES ($1, $2, $3, $4);
    `;
    const set = data.set;
    const setData = [set.id, set.title, set.description, set.dateCreated];
  
    client.query(insertSetCmd, setData);
  
    const insertCardsBase = `INSERT INTO card(id, inset, datecreated, title) VALUES`;
    const numPropertiesInCard = 4;
    const insertCardsQuery = generateInsertQuery(insertCardsBase, data.cardsInSet.length, numPropertiesInCard);
    const insertCardsValues = generateInsertCardsValuesArray(data.cardsInSet);
    
    client.query(insertCardsQuery, insertCardsValues);
  
  
    data.cardsInSet.forEach((card: CardInSet) => {
      const insertCardLinesBase = `INSERT INTO cardline (cardid, heading, content) VALUES`;
      const numPropertiesInLine = 3;
      const insertCardLinesQuery = generateInsertQuery(insertCardLinesBase, card.back.lines.length, numPropertiesInLine);
      const insertCardLinesValues = generateInsertLinesValuesArray(card);
  
      client.query(insertCardLinesQuery, insertCardLinesValues);
    });
  
    client.query('COMMIT');

    return new Response(JSON.stringify({ msg: 'success'}), {
      status: 200,
    });

  } catch (err) {
    client.query('ROLLBACK');

    return new Response(JSON.stringify({ msg: 'error' }), {
      status: 400,
    });
  } finally {
    client.release();
  }

}