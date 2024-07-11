import { ReportSummary } from "@/types/report";

interface ReportRowProps {
  summary : ReportSummary,
}
export default function ReportRow({ summary }: ReportRowProps) {

  return (
    <tr>
      <td><a href={`/set/${summary.setId}`}>{summary.setName}</a></td>
      <td><a href={`/user/${summary.setOwner}`}>{summary.setOwner}</a></td>
      <td>{summary.reportCount}</td>
      <td>{summary.earliestReport.toLocaleString()}</td>
      <td><input type="checkbox" checked={summary.resolved} readOnly/></td>
      <td><a href={`/reports/set/${summary.setId}`}>Go</a></td>
    </tr>
  )
}