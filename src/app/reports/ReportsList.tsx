'use client';

import { useEffect, useState } from "react";
import { Report } from "@/types/report";
import { getReports } from '@/app/lib/reports';
import ReportRow from "@/app/reports/ReportRow";

type ReportType = 'unresolved' | 'resolved' | 'all';

export default function ReportsList() {
  const [loadedReports, setLoadedReports] = useState<Report[]>([]);
  const [reportType, setReportType] = useState<ReportType>('unresolved');
  const [moreReports, setMoreReports] = useState(false);
  
  useEffect(() => {
    const config = {
      limit: 3,
      offset: 0,
      resolved: reportType === "all" ? undefined :
        reportType === "unresolved" ? false : true,
    }
    getReports(config)
      .then(({ reports, hasMore }) => {
        setLoadedReports(reports);
        setMoreReports(hasMore);
      })
  }, [reportType]);

  function loadMoreReports() {
    const config = {
      limit: 3, 
      offset: loadedReports.length,
      resolved: reportType === "all" ? undefined :
        reportType === "unresolved" ? false : true,
    }

    getReports(config)
    .then(({ reports, hasMore }) => {
      const allReports = loadedReports.concat(reports);

      setLoadedReports(allReports);
      setMoreReports(hasMore);
    })
  }
  return (
    <div>
      <fieldset>
        <legend>Select Reports</legend>
        <label>
          <input type="radio" name="report-type" value="unresolved" defaultChecked onClick={(e) => setReportType('unresolved')}/>
          Unresolved 
        </label>
        <label>
          <input type="radio" name="report-type" value="resolved" onClick={(e) => setReportType('resolved')}/>
          Resolved 
        </label>
        <label>
          <input type="radio" name="report-type" value="all" onClick={(e) => setReportType('all')} />
          All 
        </label>
      </fieldset>
      {
        (
          loadedReports.length > 0 &&
          loadedReports.map((report) => {
            return (
              <ReportRow key={report.id} report={report }/>
            )
          })
        ) ||
        <p>No reports found</p>
      }
      {
        moreReports &&
        <button type="button" onClick={() => loadMoreReports()}>Load More Reports</button>
      }
    </div>
  )
}