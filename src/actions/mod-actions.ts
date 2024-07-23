'use server';
import { isAdmin as checkIsAdmin } from '@/app/lib/permissions';
import { auth } from '@/auth';
import { createNotification } from '@/utils/notification';
import { sql, db } from '@vercel/postgres';
import { headers } from 'next/headers';
import { v4 as uuid } from 'uuid';

async function hideSet(setId: string, modId: string, explanation: string) {
  const setQuery = await sql`
    SELECT id, name, owner, lastmodified
    FROM set
    WHERE id = ${setId}
  ;`;

  if (setQuery.rowCount === 0) {
    throw new Error('Not found');
  }

  const set = setQuery.rows[0];
  const origin = headers().get('origin');
  const notification = createNotification({
    type: 'mod-action',
    recipient: set.owner,
    content: `Your set [${set.name}](${origin}/set/${set.id}) has been reported for breaking the rules and has been hidden. If you would like it unhidden, please edit offending content and submit a report asking for it to be unhidden.`
  });

  const client = await db.connect();

  await client.query('BEGIN');

  try {
    const now = new Date();

    await Promise.all([
      client.query('UPDATE set SET hidden = true WHERE id = $1;', [setId]),
      client.query('UPDATE report SET resolved = true WHERE setid = $1', [setId]),
      client.query(
        `INSERT INTO report_action 
          (id, moderator, date_resolved, action_taken, set_id, set_last_modified, explanation)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [ uuid(), modId, now.toISOString(), 'hide-set', setId, set.lastmodified, explanation]
      ),
      client.query(
        `INSERT INTO notification 
          (id, recipient, type, subject, content, viewed, datecreated)
         VALUES($1, $2, $3, $4, $5, $6, $7)`,
        [ 
          notification.id, notification.recipient, 
          notification.type, notification.subject, 
          notification.content, notification.viewed, 
          notification.dateCreated.toISOString()
        ]
      ),
    ]);

    await client.query('COMMIT');
  } catch (err) {
    console.log(err);
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }  
}

async function unhideSet(setId: string, modId: string, explanation: string) {
  const setQuery = await sql`
    SELECT id, name, owner, lastmodified
    FROM set
    WHERE id = ${setId}
  ;`;

  if (setQuery.rowCount === 0) {
    throw new Error('Not found');
  }

  const set = setQuery.rows[0];
  const origin = headers().get('origin');
  const notification = createNotification({
    type: 'mod-action',
    recipient: set.owner,
    content: `Your set [${set.name}](${origin}/set/${set.id}) has been unhidden. In the future please try to follow site rules.`
  });

  const client = await db.connect();

  await client.query('BEGIN');

  try {
    const now = new Date();

    await Promise.all([
      client.query('UPDATE set SET hidden = false WHERE id = $1;', [setId]),
      client.query('UPDATE report SET resolved = true WHERE setid = $1', [setId]),
      client.query(
        `INSERT INTO report_action 
          (id, moderator, date_resolved, action_taken, set_id, set_last_modified, explanation)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [ uuid(), modId, now.toISOString(), 'unhide-set', setId, set.lastmodified, explanation]
      ),
      client.query(
        `INSERT INTO notification 
          (id, recipient, type, subject, content, viewed, datecreated)
        VALUES($1, $2, $3, $4, $5, $6, $7)`,
        [ 
          notification.id, notification.recipient, 
          notification.type, notification.subject, 
          notification.content, notification.viewed, 
          notification.dateCreated.toISOString()
        ]
      ),
    ]);

    await client.query('COMMIT');
  } catch (err) {
    console.log(err);
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }  
}

export async function closeWithNoAction(setId: string, modId: string, explanation: string) {
  const setQuery = await sql`
    SELECT id, name, owner, lastmodified
    FROM set
    WHERE id = ${setId}
  ;`;

  if (setQuery.rowCount === 0) {
    throw new Error('Not found');
  }

  const set = setQuery.rows[0];
  const now = new Date();
  const client = await db.connect();
  await client.query("BEGIN");

  try {
    await Promise.all([
      client.query('UPDATE report SET resolved = true WHERE setid = $1', [setId]),
      client.query(
        `INSERT INTO report_action 
          (id, moderator, date_resolved, action_taken, set_id, set_last_modified, explanation)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [ uuid(), modId, now.toISOString(), 'no-action', setId, set.lastmodified, explanation]
      ),
    ]);

    await client.query("COMMIT");
  } catch (err) {
    console.log(err);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}
export async function takeModAction(formData: FormData) {
  const [ session, isAdmin ] = await Promise.all([
    auth(),
    checkIsAdmin(),
  ]);

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (!isAdmin) {
    throw new Error('Forbidden');
  }

  const setId = formData.get('set-id') as string;
  const action = formData.get('mod-action') as string;
  const explanation = formData.get('explanation') as string;

  switch (action) {
    case "hide-content":
      await hideSet(setId, session.user.userId, explanation);
      break;
    case "unhide-content":
      await unhideSet(setId, session.user.userId, explanation);
      break;
    case "close-no-action":
      await closeWithNoAction(setId, session.user.userId, explanation);
      break;
  }

}