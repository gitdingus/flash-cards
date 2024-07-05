'use server';
import { PopulatedReport, PopulatedReportBase, PopulatedResolvedReport } from '@/types/report';
import { sql } from '@vercel/postgres';

interface GetReportsConfig {
  resolved?: boolean,
  limit?: number,
  offset?: number,
}

export async function getReports(configOptions?: GetReportsConfig) {
  let limit = 10;
  let offset = 0;

  console.log(configOptions);
  if (configOptions?.limit) {
    limit = configOptions.limit + 1;
  }

  if (configOptions?.offset) {
    offset = configOptions.offset;
  }

  let reportQuery;

  if (configOptions?.resolved === false) {
    reportQuery = sql`
      SELECT 
        report.*, 
        set.name as set_name, 
        reporter_info.username as reporter_name, 
        reportee_info.username as reportee_name
      FROM report
      JOIN set ON set.id = report.setid 
      JOIN users AS reporter_info ON report.reporter = reporter_info.id
      JOIN users AS reportee_info ON report.reportee = reportee_info.id
      WHERE resolved = false
      LIMIT ${limit}
      OFFSET ${offset}
    ;`;
  } else if (configOptions?.resolved === true) {
    reportQuery = sql`
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
      WHERE resolved = true
      LIMIT ${limit}
      OFFSET ${offset}
    ;`;
  } else {
    reportQuery = sql`
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
      LIMIT ${limit}
      OFFSET ${offset} 
    ;`;
  }

  const reportQueryResults = await reportQuery;
  const reports: PopulatedReport[] = reportQueryResults.rows
    .filter((row, index) => index < limit - 1)
    .map((reportRow) => {
      let report;

      const base = {
        id: reportRow.id,
        reporter: reportRow.reporter,
        reportee: reportRow.reportee,
        setId: reportRow.setid,
        reason: reportRow.reason,
        dateCreated: new Date(reportRow.datecreated),
      }

      if (reportRow.resolved === false) {
        const newReport: PopulatedReportBase = {
          ...base,
          resolved: false,
          reporterName: reportRow.reporter_name,
          reporteeName: reportRow.reportee_name,
          setTitle: reportRow.set_name,
        }
        report = newReport;
      } else {
        const newReport: PopulatedResolvedReport = {
          ...base,
          dateResolved: new Date(reportRow.dateresolved),
          moderatedBy: reportRow.moderatedby,
          actionTaken: reportRow.actiontaken,
          resolved: true,
          moderatorName: reportRow.moderator_name,
          reporterName: reportRow.reporter_name,
          reporteeName: reportRow.reportee_name,
          setTitle: reportRow.set_name,
        }
        report = newReport;
      }

      return report;
    });

  const hasMore = reports.length < reportQueryResults.rowCount;
  return { reports, hasMore };
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

  console.log(reportQuery);
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