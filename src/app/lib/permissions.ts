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