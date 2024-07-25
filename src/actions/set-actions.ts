'use server';
import { db, sql, VercelPoolClient } from '@vercel/postgres';
import { getSetInfo } from '@/app/lib/data';
import { getUser, getUserById } from '@/app/lib/accounts';
import { auth } from '@/auth';
import { v4 as uuid } from 'uuid';
import { createNotification } from '@/utils/notification';
import { headers } from 'next/headers';
import { Session } from 'next-auth';
import { isSuspended } from '@/app/lib/permissions';

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
    values.push(card.id, card.inSet, card.dateCreated.toISOString(), card.front.title, card.lastModified.toISOString());
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

export async function createSet({ newSet, cardsInSet }: { newSet: SetInfoBase, cardsInSet: CardInSet[] }, formData: FormData) {
  const [ client, session ] = await Promise.all([
    db.connect(),
    auth(),
  ]);

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (await isSuspended()) {
    throw new Error('Can not create new sets while account is suspended');
  }

  try {
    await client.query('BEGIN');
    
    const insertSetCmd = `
      INSERT INTO set (id, name, description, datecreated, owner, public, lastmodified)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;
    const setData = [newSet.id, newSet.title, newSet.description, newSet.dateCreated, session.user.userId, newSet.isPublic, newSet.dateCreated];
  
    await client.query(insertSetCmd, setData);

    const insertCardsBase = `INSERT INTO card(id, inset, datecreated, title, lastmodified) VALUES`;
    const numPropertiesInCard = 5;
    const insertCardsQuery = generateInsertQuery(insertCardsBase, cardsInSet.length, numPropertiesInCard);
    const insertCardsValues = generateInsertCardsValuesArray(cardsInSet);
    
    await client.query(insertCardsQuery, insertCardsValues);

    cardsInSet.forEach(async (card: CardInSet) => {
      const insertCardLinesBase = `INSERT INTO cardline (id, cardid, heading, content) VALUES`;
      const numPropertiesInLine = 4;
      const insertCardLinesQuery = generateInsertQuery(insertCardLinesBase, card.back.lines.length, numPropertiesInLine);
      const insertCardLinesValues = generateInsertLinesValuesArray(card);
  
      await client.query(insertCardLinesQuery, insertCardLinesValues);
    });
  
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
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
      id: line.id,
      cardId: line.cardid,
      heading: line.heading,
      content: line.content,
    };

    return newLine;
  })

  return lines;
}

async function getCardAndSetIdFromLine(session: Session ,client: VercelPoolClient, line: Line) {
  const cardIdFromLine = await client.query("SELECT cardid FROM cardline WHERE id = $1", [line.id]);

  if (cardIdFromLine.rowCount == 0) {
    throw new Error(`Can not find line ${line.id}`);
  }
  
  const cardId: string = cardIdFromLine.rows[0].cardid;
  const setInfoFromCard = await client.query("SELECT inset FROM card WHERE id = $1", [cardId]);

  if (setInfoFromCard.rowCount == 0) {
    throw new Error(`Can not find card that line ${line.id} belongs to`);
  }

  const setId: string = setInfoFromCard.rows[0].inset;

  const setInfo = await client.query("SELECT owner FROM set WHERE id = $1", [setId]);

  if (setInfo.rowCount == 0) {
    throw new Error(`Can not find set that card ${cardId} belongs to`);
  }

  if (setInfo.rows[0].owner !== session.user.userId) {
    throw new Error('Forbidden');
  }

  return { setId, cardId }
}

export async function removeLine(line: Line) {
  const session = await auth();

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (await isSuspended()) {
    throw new Error('Can not edit sets while account is suspended');
  }

  const client = await db.connect();
  const { setId, cardId } = await getCardAndSetIdFromLine(session, client, line);
  const now = new Date();

  try {
    await client.query("BEGIN");
    const updates = Promise.all([
      client.query("DELETE FROM cardline WHERE id = $1", [line.id]),
      client.query("UPDATE card SET lastmodified = $1 WHERE id = $2", [now.toISOString(), cardId]),
      client.query("UPDATE set SET lastmodified = $1 WHERE id = $2", [now.toISOString(), setId]),
    ]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

export async function editLine(line: Line) {
  const session = await auth();

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (await isSuspended()) {
    throw new Error('Can not edit sets while account is suspended');
  }

  const client = await db.connect();
  const { setId, cardId } = await getCardAndSetIdFromLine(session, client, line);
  const now = new Date();

  try {
    await client.query("BEGIN");
    const updates = Promise.all([
      client.query('UPDATE cardline SET heading = $1, content = $2 WHERE id = $3', [line.heading, line.content, line.id]),
      client.query("UPDATE card SET lastmodified = $1 WHERE id = $2", [now.toISOString(), cardId]),
      client.query("UPDATE set SET lastmodified = $1 WHERE id = $2", [now.toISOString(), setId]),
    ]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

export async function saveNewLine(line: Line, card: CardBase) {
  const session = await auth();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (await isSuspended()) {
    throw new Error('Can not edit sets while account is suspended');
  }
  
  const client = await db.connect();

  const cardInfo = await client.query('SELECT inset FROM card WHERE id = $1', [card.id]);
  
  if (cardInfo.rowCount == 0) {
    throw new Error(`Can not find card ${card.id}`);
  }

  const setId = cardInfo.rows[0].inset;

  const setInfo = await client.query('SELECT owner FROM set WHERE id = $1', [setId]);

  if (setInfo.rowCount == 0) {
    throw new Error(`Can not find set that card ${card.id} belongs to`);
  }

  if (setInfo.rows[0].owner != session.user.userId) {
    throw new Error('Forbidden');
  }

  const now = new Date();

  try {
    await client.query("BEGIN");
    const updates = Promise.all([
      client.query('INSERT INTO cardline (id, cardid, heading, content) VALUES ($1, $2, $3, $4);', [line.id, card.id, line.heading, line.content]),
      client.query("UPDATE card SET lastmodified = $1 WHERE id = $2", [now.toISOString(), card.id]),
      client.query("UPDATE set SET lastmodified = $1 WHERE id = $2", [now.toISOString(), setId]),
    ]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

export async function saveNewCard(card: CardBase, set: SetInfo) {
  const [client, session] = await Promise.all([
    db.connect(),
    auth(),
  ]);

  const setOwnerCheck = await client.query("SELECT owner FROM set WHERE id = $1",[set.id]);

  if (setOwnerCheck.rowCount == 0) {
    throw new Error(`Can not find set ${set.id} to insert card into`);
  }

  if (!session || session.user.userId !== setOwnerCheck.rows[0].owner) {
    throw new Error('Unauthorized');
  }

  if (await isSuspended()) {
    throw new Error('Can not edit sets while account is suspended');
  }

  const cardInSet: CardInSet = {
    ...card,
    inSet: set.id,
  }

  const insertCardLinesBase = `INSERT INTO cardline (id, cardid, heading, content) VALUES`;
  const numPropertiesInLine = 4;
  const insertCardLinesQuery = generateInsertQuery(insertCardLinesBase, cardInSet.back.lines.length, numPropertiesInLine);
  const insertCardLinesValues = generateInsertLinesValuesArray(cardInSet);

  try {  
    await client.query('BEGIN');


    const changes = await Promise.all([
      client.query(`
        INSERT INTO card (id, inset, datecreated, title, lastmodified) VALUES ($1, $2, $3, $4, $5);`,
        [
          cardInSet.id, 
          cardInSet.inSet, 
          cardInSet.dateCreated.toISOString(), 
          cardInSet.front.title,
          cardInSet.lastModified.toISOString(),
        ]
      ),
      client.query(insertCardLinesQuery, insertCardLinesValues),
      client.query("UPDATE set SET lastmodified = $1 WHERE id = $2", [cardInSet.lastModified.toISOString(), set.id]),
    ]);

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

  if (await isSuspended()) {
    throw new Error('Can not edit sets while account is suspended');
  }

  if (set.rows.length != 1) {
    throw new Error('Not found');
  }

  if (set.rows[0].owner !== session.user.userId) {
    throw new Error('Forbidden');
  }

  const client = await db.connect();
  const now = new Date();
  try {
    await client.query('BEGIN');

    const queries = await Promise.all([
      client.query("DELETE FROM cardline WHERE id IN (SELECT id FROM cardline WHERE cardid = $1)", [card.id]),
      client.query("DELETE FROM card WHERE id = $1", [card.id]),
      client.query("UPDATE set SET lastmodified = $1 WHERE id = $2", [now.toISOString(), set.rows[0].id]),
    ]);

    await client.query('COMMIT');
  } catch (err) {
    console.log(err);
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

export async function editCardTitle(card: CardInSet) {
  const [ client, set, session ] = await Promise.all([
    db.connect(),
    sql`SELECT * FROM set WHERE id = ${card.inSet}`,
    auth(),
  ]);

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (await isSuspended()) {
    throw new Error('Can not edit sets while account is suspended');
  }

  if (set.rows.length != 1) {
    throw new Error('Not found');
  }

  if (set.rows[0].owner !== session.user.userId) {
    throw new Error('Forbidden');
  }

  const now = new Date().toISOString();
  const queries = await Promise.all([
    client.query("UPDATE card SET title = $1, lastmodified = $2 WHERE id = $3", [card.front.title, now, card.id]),
    client.query("UPDATE set SET lastmodified = $1 WHERE id = $2", [now, set.rows[0].id]),
  ]);

}

export async function updateSetInformation(set: SetInfoBase) {
  const [ setOwner, session ] = await Promise.all([
    sql`SELECT owner FROM set WHERE id = ${set.id};`,
    auth(),
  ]);

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (await isSuspended()) {
    throw new Error('Can not edit sets while account is suspended');
  }

  if (setOwner.rows.length !== 1) {
    throw new Error('Not found');
  }

  if (session.user.userId != setOwner.rows[0].owner) {
    throw new Error('Forbidden');
  }

  const now = new Date().toISOString();
  await sql`UPDATE set SET name = ${set.title}, description = ${set.description}, public = ${set.isPublic}, lastmodified = ${now} WHERE id = ${set.id};`;

}

export async function setVisibility(formData: FormData) {
  const setId = formData.get('setId') as string;

  if (!setId) {
    return null;
  }

  const [ set, session ] = await Promise.all([
    getSetInfo(setId),
    auth(),
  ]);
  
  if (!set) {
    throw new Error('Not Found');
  }

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (await isSuspended()) {
    throw new Error('Can not edit sets while account is suspended');
  }

  if (session.user.userId !== set.ownerId) {
    throw new Error('Forbidden');
  }

  const setOwner = await getUserById(set.ownerId);

  if (formData.get('visibility') === 'public') {
    await sql`UPDATE set SET public = true WHERE id = ${set.id}`;
  } else if (formData.get('visibility') === 'private') {
    const client = await db.connect();

    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE set SET public = false WHERE id = $1`,
        [set.id]
      );

      const userField = formData.get('user') as string;
      const baseUrl = headers().get('origin');
      let user; 
  
      if (userField){
        switch (formData.get('permissions')) {
          case 'allow':
            user = await getUser(userField);
            let acceptContentMarkdown = `You have been granted access to the set [${set.name}](${baseUrl}/set/${set.id}) by [${setOwner.username}](${baseUrl}/user/${setOwner.username})!`;
            const allowNotification = createNotification({
              type: 'set-permission-granted',
              recipient: user,
              content: acceptContentMarkdown,
            });

            await client.query(
              `INSERT INTO setpermission (id, setid, userid, granted)
               VALUES ($1, $2, $3, $4);`,
              [uuid(), set.id, user.id, true]
            );
            
            await client.query(
              `INSERT INTO notification (id, type, subject, content, recipient, viewed, datecreated)
              VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [ 
                allowNotification.id, 
                allowNotification.type,
                allowNotification.subject,
                allowNotification.content,
                allowNotification.recipient.id,
                allowNotification.viewed,
                allowNotification.dateCreated,
              ]
            );
            break;
          case 'revoke':
            user = await getUserById(userField);
            let rejectContentMarkdown = `Access to set [${set.name}](${baseUrl}/set/${set.id}) has been revoked by [${setOwner.username}](${baseUrl}/user/${setOwner.username}).`;
            const revokeNotification = createNotification({
              type: 'set-permission-revoked',
              recipient: user,
              content: rejectContentMarkdown,
            });

            await client.query(
            `DELETE FROM setpermission 
             WHERE setid = $1
               AND userid = $2;
            `, [set.id, user.id]);

            await client.query(
              `INSERT INTO notification (id, type, subject, content, recipient, viewed, datecreated)
              VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [ 
                revokeNotification.id, 
                revokeNotification.type,
                revokeNotification.subject,
                revokeNotification.content,
                revokeNotification.recipient.id,
                revokeNotification.viewed,
                revokeNotification.dateCreated,
              ]
            );
            break;
        }
      }
      client.query('COMMIT');
    } catch (err) {
      console.log(err);
      client.query('ROLLBACK');
    } finally {
      client.release();
    }
  }
}

