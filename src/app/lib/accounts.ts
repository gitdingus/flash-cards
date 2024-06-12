'use server';
import { sql } from '@vercel/postgres';
import { saltHash } from '@/utils/passwords';
import { v4 as uuid } from 'uuid';

export async function duplicateUsername(username: string) {
  const findUsername = await sql`
    SELECT username FROM users WHERE username = ${username};
  `;

  return findUsername.rows.length > 0;
}

export async function emailUsed(email: string) {
  const findEmail = await sql`
    SELECT email FROM users WHERE email = ${email};
  `;

  return findEmail.rows.length > 0;
}

export async function getUser(username: string) {
  const user = await sql`SELECT * FROM users WHERE username = ${username};`;
  return user.rows[0];
}

export async function getUserById(id: string) {
  const userQuery = await sql`SELECT * FROM users WHERE id = ${id}`;

  if (userQuery.rows.length != 1) {
    return null;
  }

  const userRecord = userQuery.rows[0];

  const user: PublicUser = {
    id: userRecord.id,
    dateCreated: userRecord.datecreated,
    username: userRecord.username,
    email: userRecord.email,  
  }

  return user;
}

export async function insertAccount(username: string, password: string, email: string) {
  const { salt, hash } = saltHash(password);
  const created = new Date().toISOString();

  const newUser: UserRecord = {
    id: uuid(),
    username,
    salt,
    passwordhash: hash,
    email,
    datecreated: created,
  } 

  await sql`
    INSERT 
    INTO users (id, username, passwordhash, salt, email, datecreated)
    VALUES(
      ${newUser.id}, 
      ${newUser.username}, 
      ${newUser.passwordhash},
      ${newUser.salt},
      ${newUser.email},
      ${newUser.datecreated}
    );
  `;
}