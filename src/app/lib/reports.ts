'use server';
import { ReportSummaryBase, PopulatedResolvedReport, FriendlyReportBase } from '@/types/report';
import { sql, db } from '@vercel/postgres';

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
  const config = mergeGetReportsConfig(configOptions);
  const client = await db.connect();
  let queryArgs = [config.resolved, config.limit + 1, config.offset];
  let queryString = 
  `
      SELECT 
        report.setid, 
        set.name, 
        users.username,
        users.id,
        report.resolved,
        COUNT(DISTINCT report.id) AS report_count,
        MIN(report.datecreated AT TIME ZONE 'UTC') AS earliest_report
      FROM report
      JOIN set ON report.setid = set.id
      JOIN users ON report.reportee = users.id
  `
    + `${config.resolved !== 'all' ? ' WHERE resolved = $1 ' : ''}`
    + ` GROUP BY report.setid, set.name, users.username, users.id, report.resolved`
    + ` ORDER BY ${config.orderBy.column === "earliest_report" ? "earliest_report" : "report_count"} ` + `${config.orderBy.direction === "ASC" ? "ASC" : "DESC"}`
    + ` LIMIT $2`
    + ` OFFSET $3`;

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
      }

      return reportSummary;
    });

    return {
      summaries,
      hasMore: summaries.length < reportQueryResults.rowCount,
    }
}

export async function getReport(id: string) {
  const reportQuery = await sql`
    SELECT 
      report.*, 
      set.name as set_name, 
      reporter_info.username as reporter_name, 
      reportee_info.username as reportee_name, 
      moderator_info.username as moderator_name
    FROM report
    JOIN set ON set.id = report.setid 
    JOIN users AS reporter_info ON report.reporter = reporter_info.id
    JOIN users AS reportee_info ON report.reportee = reportee_info.id
    LEFT JOIN users AS moderator_info ON report.moderatedby = moderator_info.id
    WHERE report.id = ${id};
  ;`;

  if (reportQuery.rowCount === 0) {
    return null;
  }
  
  const reportRow = reportQuery.rows[0];
  const report: PopulatedResolvedReport = {
    moderatorName: reportRow.moderator_name,
    dateResolved: new Date(reportRow.dateresolved),
    moderatedBy: reportRow.moderatedby,
    actionTaken: reportRow.actiontaken,
    id: reportRow.id,
    reporter: reportRow.reporter,
    reportee: reportRow.reportee,
    setId: reportRow.setid,
    reason: reportRow.reason,
    dateCreated: new Date(reportRow.datecreated),
    resolved: reportRow.resolved,
    reporterName: reportRow.reporter_name,
    reporteeName: reportRow.reportee_name,
    setTitle: reportRow.set_name,
  }

  return report;
}