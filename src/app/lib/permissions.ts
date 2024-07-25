'use server';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';

export async function hasAccessToSet(ownerId: string, userId: string, setId: string) {
  const setPermissionQuery = await sql`
    SELECT * 
    FROM setpermission
    WHERE 
      userid = ${userId}
      AND setid = ${setId}
  ;`;

  if (await isAdmin()) {
    return true;
  }

  if (ownerId === userId) {
    return true;
  }

  if (setPermissionQuery.rowCount > 0 && setPermissionQuery.rows[0].granted === true) {
    return true;
  }
  
  return false;
}

export async function isAdmin() {
  const session = await auth();

  if (!session) {
    return false;
  }

  const isAdminQuery = await sql`
    SELECT *
    FROM user_role
    JOIN role ON user_role.role_id = role.role_id
    WHERE user_role.user_id = ${session.user.userId}
      AND role.role = 'admin'
  ;`;

  if (isAdminQuery.rowCount === 1) {
    return true;
  }

  return false;
}

export async function isSuspended() {
  const session = await auth();

  if (!session) {
    // if not logged in just return true to prevent possible api access
    return true; 
  }

  const suspendedQuery = await sql`
    SELECT id, user_id, forever, (active_until AT TIME ZONE 'UTC') AS active_until
    FROM suspended_user 
    WHERE user_id = ${session.user.userId}
    ORDER BY active_until DESC
    LIMIT 1
  ;`;

  if (suspendedQuery.rowCount === 0) {
    return false;
  }

  const suspension = suspendedQuery.rows[0];

  if (suspension.forever) {
    return true;
  }

  if (!suspension.active_until) {
    // if suspension.forever is false and there is no active_until date
    // consider them not suspended, this should not happen. 
    return false; 
  }

  const now = new Date();

  if (now.valueOf() < suspension.active_until.valueOf()) {
    return true;
  }

  return false;
}