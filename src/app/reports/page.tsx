import { auth } from '@/auth';
import { sql } from '@vercel/postgres';
import NotFound from '@/app/not-found'
import ReportsList from '@/app/reports/ReportsList';

export default async function Reports() {
  const session = await auth();
  if (!session) {
    return <NotFound />
  }

  const isAdminQuery = await sql`
    SELECT users.id, role.role 
    FROM user_role 
    JOIN users ON users.id = user_role.user_id
    JOIN role ON role.role_id = user_role.role_id
    WHERE user_role.user_id = ${session.user.userId}
  ;`;

  if (isAdminQuery.rowCount === 0) {
    return <NotFound />
  }

  return (
    <ReportsList />
  )
}