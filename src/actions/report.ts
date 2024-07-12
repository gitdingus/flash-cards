'use server';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';
import { getSetInfo } from '@/app/lib/data';
import { v4 as uuid } from 'uuid';
import { ReportBase } from '@/types/report';
interface CreateReportState {
  form?: string,
  report?: string,
}

export async function createReport(prevState: CreateReportState, formData: FormData) {
  const newState: CreateReportState = {};
  const setId = formData.get('setId') as string;
  const report = formData.get('report') as string;
  const [session, set] = await Promise.all([
    auth(),
    getSetInfo(setId),
  ]);

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (!set) {
    throw new Error('Set not found');
  }

  const checkForPreviousReport = await sql`
    SELECT MAX(datecreated AT TIME ZONE 'UTC') AS lastreport
    FROM report 
    WHERE reporter = ${session.user.userId}
      AND setid = ${set.id}
  ;`;

  if (checkForPreviousReport.rowCount > 0) {
    const dayInMilli = 1000 * 60 * 60 * 24;
    const lastReport = new Date(checkForPreviousReport.rows[0].lastreport).valueOf();
    const now = Date.now();
    const dayPassed = (now - lastReport) >= dayInMilli;

    if (!dayPassed) {
      newState.form ='You can only report a set once per day.';
      return newState;
    }
  }

  if (report === '') {
    newState.report = 'Must provide a reason.';
    return newState;
  }

  const newReport: ReportBase = {
    reportId: uuid(),
    reporter: session.user.userId,
    reportee: set.owner,
    setId: set.id,
    reason: report,
    resolved: false,
    dateCreated: new Date(),
    setLastModified: set.lastModified,
  }

  await sql`
    INSERT INTO report (id, reporter, reportee, setid, reason, resolved, datecreated, set_last_modified) 
    VALUES (
      ${newReport.reportId}, 
      ${newReport.reporter}, 
      ${newReport.reportee}, 
      ${newReport.setId}, 
      ${newReport.reason}, 
      ${newReport.resolved},
      ${newReport.dateCreated.toISOString()},
      ${newReport.setLastModified.toISOString()},
    )
  ;`;

  newState.form = 'reported';
  return newState;
}