import { useEffect, useState } from 'react';
import { getReports } from '@/app/lib/reports';
import { FriendlyReportBase } from '@/types/report';

interface PastReportsProps {
  id: string,
  resolved?: boolean,
  dateLastModified?: Date,
}

export default function PastReports({ id, resolved, dateLastModified }: PastReportsProps) {
  const [loadedReports, setLoadedReports] = useState<FriendlyReportBase[]>([]);
  const [hasMoreReports, setHasMoreReports] = useState(false);

  useEffect(() => {
    getReports(id, { limit: 3, offset: 0, resolved: !!resolved, lastModified: dateLastModified ? dateLastModified : undefined })
      .then(({ setInfo, reports, hasMore }) => {
        setLoadedReports(reports);
        setHasMoreReports(hasMore);
      });
  }, [id]); 

  function loadMoreReports(){
    getReports(id, { limit: 3, offset: loadedReports.length, resolved: !!resolved, lastModified: dateLastModified ? dateLastModified : undefined })
    .then(({ reports, hasMore }) => {
      const newReports = loadedReports.concat(reports);
      setLoadedReports(newReports);
      setHasMoreReports(hasMore);
    });
  }

  return (
    <div>
      {
        loadedReports.length > 0 &&
        <div>
          <h1>Past Reports</h1>
          {
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
        </div>
      }
      {
        hasMoreReports && 
        <div>
          <button type="button" onClick={loadMoreReports}>Load more reports</button>
        </div>
      }
    </div>
  )
}