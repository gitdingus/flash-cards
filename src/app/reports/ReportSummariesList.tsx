'use client';

import { useEffect, useState } from "react";
import { ReportSummary } from "@/types/report";
import { getReportSummaries } from '@/app/lib/reports';
import ReportSummaryRow from "@/app/reports/ReportSummaryRow";

type ReportType = 'unresolved' | 'resolved' | 'all';

export default function ReportsList() {
  const [loadedSummaries, setLoadedSummaries] = useState<ReportSummary[]>([]);
  const [reportType, setReportType] = useState<ReportType>('unresolved');
  const [moreSummaries, setMoreSummaries] = useState(false);
  
  useEffect(() => {
    const config = {
      limit: 2,
      offset: 0,
      resolved: reportType === "all" ? undefined :
        reportType === "unresolved" ? false : true,
    }
    getReportSummaries(config)
      .then(({ summaries, hasMore }) => {
        setLoadedSummaries(summaries);
        setMoreSummaries(hasMore);
      })
  }, [reportType]);

  function loadMoreSummaries() {
    const config = {
      limit: 2, 
      offset: loadedSummaries.length,
      resolved: reportType === "all" ? undefined :
        reportType === "unresolved" ? false : true,
    }

    getReportSummaries(config)
    .then(({ summaries, hasMore }) => {
      const allSummaries = loadedSummaries.concat(summaries);

      setLoadedSummaries(allSummaries);
      setMoreSummaries(hasMore);
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
          loadedSummaries.length > 0 && 
          <table>
            <thead>
              <tr>
                <td>Set</td>
                <td>Author</td>
                <td>Number of Reports</td>
                <td>Earliest Report</td>
                <td>Resolved</td>
                <td>View FullReport</td>
              </tr>
            </thead>
            <tbody>
              {
                loadedSummaries.map((summary) => {
                  return (
                    <ReportSummaryRow key={summary.setId} summary={summary}/>
                  )
                })
              }
            </tbody>
          </table>
        ) || <p>No reports found</p>
      }
      {
        moreSummaries &&
        <button type="button" onClick={() => loadMoreSummaries()}>Load More Reports</button>
      }
    </div>
  )
}