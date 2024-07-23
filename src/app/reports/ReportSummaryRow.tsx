import { ReportSummaryBase } from "@/types/report";

interface ReportRowProps {
  summary : ReportSummaryBase,
}
export default function ReportRow({ summary }: ReportRowProps) {
  return (
    <tr>
      <td><a href={`/set/${summary.setId}`}>{summary.setName}</a></td>
      <td><a href={`/user/${summary.setOwner}`}>{summary.setOwner}</a></td>
      <td>{summary.reportCount}</td>
      <td>{summary.earliestReport.toLocaleString()}</td>
      <td><input type="checkbox" checked={summary.resolved} readOnly/></td>
      <td><a href={`/reports/set/${summary.setId}${summary.resolved ? `?resolved=true&lastModified=${encodeURIComponent(summary.setLastModified.toISOString())}` : ''}`}>Go</a></td>
    </tr>
  )
}