'use client';
import { useEffect, useState } from 'react';
import { getReports } from '@/app/lib/reports';
import { FriendlyReportBase } from '@/types/report';
import { PopulatedSetRecord } from '@/types/set';
import { takeModAction } from '@/actions/mod-actions';

interface ReportSummaryProps {
  params: {
    id: string,
  },
};

interface TopLevelInfo  {
  reporteeName: string,
  setId: string,
  setName: string,
}

export default function ReportSummary({ params: { id }}: ReportSummaryProps) {
  const [loadedReports, setLoadedReports] = useState<FriendlyReportBase[]>([]);
  const [hasMoreReports, setHasMoreReports] = useState(false);
  const [topLevelInfo, setTopLevelInfo] = useState<PopulatedSetRecord>();

  useEffect(() => {
    getReports(id, { limit: 3 })
      .then(({ setInfo, reports, hasMore }) => {
        setTopLevelInfo(setInfo);
        setLoadedReports(reports);
        setHasMoreReports(hasMore);
      });
  }, [id]);

  function loadMoreReports(){
    getReports(id, { limit: 3, offset: loadedReports.length })
    .then(({ reports, hasMore }) => {
      const newReports = loadedReports.concat(reports);
      setLoadedReports(newReports);
      setHasMoreReports(hasMore);
    });
  }
  return (
    <div>
      <div>
        <p>Set: <a href={`/set/${topLevelInfo?.id}`}>{topLevelInfo?.name}</a></p>
        <p>User: <a href={`/user/${topLevelInfo?.ownerUsername}`}>{topLevelInfo?.ownerUsername}</a></p>
      </div>
      <div>
        <form action={takeModAction}>
          <input type="hidden" name="set-id" value={id} />
          <label>
            Mod actions:
            <select name="mod-action">
              <option value="hide-content">Hide content</option>
            </select>
          </label>
          <label>
            Explanation:
            <textarea name="explanation"></textarea>
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
      <div>
        {
          loadedReports.length > 0 &&
          loadedReports.map((report) => {
            return (
              <div key={report.reportId}>
                <p>Reporter: <a href={`/user/${report.reporterName}`}>{report.reporterName}</a></p>
                <p>Reported On: {report.dateCreated.toISOString()}</p>
                <p>Reason: {report.reason}</p>
              </div>
            )
          })
        }
        {
          hasMoreReports && 
          <div>
            <button type="button" onClick={loadMoreReports}>Load more reports</button>
          </div>
        }
      </div>
    </div>
  )
}