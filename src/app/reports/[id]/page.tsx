import { getReport } from '@/app/lib/reports';
import NotFound from '@/app/not-found';
import { isAdmin as checkAdmin } from '@/app/lib/permissions';


interface ReportProps {
  params: {
    id: string,
  }
}

export default async function Report({ params: { id } }: ReportProps) {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return <NotFound />;
  }

  const report = await getReport(id);

  if (!report) {
    return <p>Report not found</p>
  }
  return (
    <div>
      <fieldset>
        <legend>Set Information</legend>
        <p>Set: {report.setTitle}</p>
        <p>Owner: {report.reporteeName}</p>
        <p><a href={`/set/${report.setId}`}>View Set</a></p>
      </fieldset>
      <fieldset>
        <legend>Report Information</legend>
        <p>Date Submitted: {report.dateCreated.toUTCString()}</p>
        <p>Reporting User: {report.reporterName}</p>
        <p>Reason: {report.reason}</p>
      </fieldset>
      {
        report.resolved &&
        <fieldset>
          <legend>Moderation Information</legend>
          <p>Date Resolved: {report.dateResolved.toUTCString()}</p>
          <p>Moderator: {report.moderatorName}</p>
          <p>Action Taken: {report.actionTaken}</p>
        </fieldset>
      }
      {
        !report.resolved && 
        <form>
          <fieldset>
            <legend>Moderator Action</legend>
            <select>
              <option>Ban User</option>
              <option>Hide Content</option>
              <option>Delete Content</option>
            </select>
            <button type="submit">Submit</button>
          </fieldset>
        </form>
      }
    </div>
  )
}