'use server';
import { ReportSummaryBase, FriendlyReportAction, FriendlyReportBase } from '@/types/report';
import { PopulatedSetRecord } from '@/types/set';
import { sql, db } from '@vercel/postgres';
import { isAdmin as checkIsAdmin } from '@/app/lib/permissions';

interface OrderByOptions {
  column: "earliest_report" | "report_count",
  direction: "ASC" | "DESC",
}

interface GetReportsSummariesConfig {
  resolved?: boolean | 'all',
  limit?: number,
  offset?: number,
  orderBy?: OrderByOptions,
}

interface CompleteGetReportsSummariesConfig {
  resolved: boolean | 'all',
  limit: number,
  offset: number,
  orderBy: OrderByOptions,
}

function mergeGetReportsConfig(configOptions: GetReportsSummariesConfig) {
  const defaultConfig: CompleteGetReportsSummariesConfig = {
    resolved: false,
    limit: 10,
    offset: 0,
    orderBy: {
      column: 'earliest_report',
      direction: 'ASC',
    }
  }

  return Object.assign({}, defaultConfig, configOptions);
}

export async function getReportSummaries(configOptions: GetReportsSummariesConfig) {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    throw new Error('Forbidden');
  }

  const config = mergeGetReportsConfig(configOptions);
  const client = await db.connect();
  let queryArgs; 

  if (config.resolved === 'all') {
    queryArgs = [config.limit + 1, config.offset];
  } else {
    queryArgs = [config.resolved, config.limit + 1, config.offset];
  }

  let queryString = 
  `
      SELECT 
        report.setid, 
        set.name, 
        users.username,
        users.id,
        report.resolved,
        report.set_last_modified,
        COUNT(DISTINCT report.id) AS report_count,
        MIN(report.datecreated AT TIME ZONE 'UTC') AS earliest_report
      FROM report
      JOIN set ON report.setid = set.id
      JOIN users ON report.reportee = users.id
  `
    + `${config.resolved !== 'all' ? ' WHERE resolved = $1 ' : ''}`
    + ` GROUP BY report.setid, set.name, users.username, users.id, report.resolved, report.set_last_modified`
    + ` ORDER BY ${config.orderBy.column === "earliest_report" ? "earliest_report" : "report_count"} ` + `${config.orderBy.direction === "ASC" ? "ASC" : "DESC"}`
    + ` LIMIT ${config.resolved === 'all' ? '$1' : '$2'}`
    + ` OFFSET ${config.resolved === 'all' ? '$2' : '$3'}`;

  const reportQueryResults = await client.query(queryString, queryArgs);
  client.release();
  
  const summaries: ReportSummaryBase[] = reportQueryResults.rows
    .filter((row, index) => index < config.limit)
    .map((row) => {
      const reportSummary: ReportSummaryBase = {
        setId: row.setid,
        setName: row.name,
        setOwner: row.username,
        reportCount: row.report_count,
        earliestReport: new Date(row.earliest_report),
        resolved: row.resolved,
        setLastModified: row.set_last_modified,
      }

      return reportSummary;
    });

  return {
    summaries,
    hasMore: summaries.length < reportQueryResults.rowCount,
  }
}

interface GetReportsConfig {
  limit?: number,
  offset?: number,
  resolved?: boolean,
  lastModified?: Date,
  orderBy?: {
    column: "report.datecreated",
    direction: "ASC" | "DESC",
  }
}

interface CompleteGetReportsConfig {
  limit: number,
  offset: number,
  resolved: boolean,
  lastModified?: Date,
  orderBy: {
    column: "report.datecreated",
    direction: "ASC" | "DESC",
  }
}


export async function getReports(setId: string, reportsConfig: GetReportsConfig) {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin){
    throw new Error('Forbidden');
  }
  
  const completeConfig: CompleteGetReportsConfig = {
    limit: 10,
    offset: 0,
    resolved: false,
    orderBy: {
      column: 'report.datecreated',
      direction: 'ASC'
    }
  }

  const config: CompleteGetReportsConfig = Object.assign({}, completeConfig, reportsConfig);
  const client = await db.connect();

  const queryArgs = [config.resolved, setId, config.limit + 1, config.offset];
  const queryString = `
    SELECT 
      report.id,
      report.setid,
      (report.datecreated AT TIME ZONE 'UTC') AS datecreated,
      report.reason,
      report.resolved,
      (report.set_last_modified AT TIME ZONE 'UTC') AS set_last_modified,
      set.name AS set_name,
      reporter.username AS reporter_username,
      reportee.username AS reportee_username
    FROM report 
    JOIN set ON set.id = report.setid
    JOIN users AS reporter ON report.reporter = reporter.id
    JOIN users AS reportee ON report.reportee = reportee.id 
    WHERE report.resolved = $1 AND report.setid = $2 
  ` 
  + ` ORDER BY ` + config.orderBy.column + ' ' + config.orderBy.direction
  + ` LIMIT $3 `
  + ` OFFSET $4;`;

  const [reportQuery, setQuery] = await Promise.all([
    client.query(queryString, queryArgs),
    sql`
      SELECT 
        set.id,
        set.name,
        set.description,
        set.public,
        set.hidden,
        set.owner,
        (set.datecreated AT TIME ZONE 'UTC') AS datecreated,
        (set.lastmodified AT TIME ZONE 'UTC') AS lastmodified,
        users.username AS owner_username
      FROM set
      JOIN users ON users.id = set.owner
      WHERE set.id = ${setId};
    `,
  ]);

  const reports: FriendlyReportBase[] = reportQuery.rows
    .filter((row, index) => index < config.limit)
    .map((row) => {
      const report: FriendlyReportBase = {
        reporterName: row.reporter_username,
        reporteeName: row.reportee_username,
        setName: row.set_name,
        reportId: row.id,
        setId: row.setid,
        reason: row.reason,
        dateCreated: new Date(row.datecreated),
        resolved: row.resolved,
        setLastModified: new Date(row.set_last_modified),
      }

      return report;
    });

    const setRow = setQuery.rows[0];
    const setInfo: PopulatedSetRecord = {
      ownerUsername: setRow.owner_username,
      id: setRow.id,
      name: setRow.name,
      description: setRow.description,
      ownerId: setRow.owner,
      public: setRow.public,
      hidden: setRow.hidden,
      dateCreated: new Date(setRow.datecreated),
      lastModified: new Date(setRow.lastmodified),
    }
  return { setInfo, reports, hasMore: reports.length < reportQuery.rowCount }
}

export async function getPastActions(setId: string) {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin){
    throw new Error('Forbidden');
  }

  const pastActionsQuery = await sql`
    SELECT *, moderator.username AS moderator_username
    FROM report_action
    JOIN users AS moderator ON moderator.id = report_action.moderator
    WHERE report_action.set_id = ${setId}
  ;`;

  const pastActions: FriendlyReportAction[] = pastActionsQuery.rows.map((row) => {
    const pastAction: FriendlyReportAction = {
      id: row.id,
      moderator: row.moderator,
      dateResolved: new Date(row.date_resolved),
      actionTaken: row.action_taken,
      explanation: row.explanation,
      setId: row.set_id,
      setLastModified: new Date(row.set_last_modified),
      moderatorUsername: row.moderator_username,
    }

    return pastAction;
  });
  
  return pastActions;
}