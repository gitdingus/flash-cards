import { PopulatedReport } from "@/types/report";

interface ReportRowProps {
  report : PopulatedReport,
}
export default function ReportRow({ report }: ReportRowProps) {

  return (
    <div>
      <p>Set: <a href={`/set/${report.setId}`}>{report.setTitle}</a></p>
      <p>Submitted: {report.dateCreated.toString()}</p>
      <label>
        Resolved
        <input type="checkbox" checked={report.resolved} readOnly /> 
      </label>
      <p>Reason: {report.reason}</p>
      <p><a href={`/reports/${report.id}`}>View full report</a></p>
    </div>
  )
}