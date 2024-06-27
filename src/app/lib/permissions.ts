'use server';
import { sql } from '@vercel/postgres';

export async function hasAccessToSet(ownerId: string, userId: string, setId: string) {
  const setPermissionQuery = await sql`
    SELECT * 
    FROM setpermission
    WHERE 
      userid = ${userId}
      AND setid = ${setId}
  ;`;

  return ownerId === userId 
    || (setPermissionQuery.rowCount > 0 && setPermissionQuery.rows[0].granted === true);
}