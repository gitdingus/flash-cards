interface ReportBase {
  id: string, 
  reporter: string,
  reportee: string,
  setId: string,
  reason: string,
  dateCreated: Date,
  resolved: boolean,
} 

interface ResolvedReport extends ReportBase {
  dateResolved: Date,
  moderatedBy: string,
  actionTaken: string,
}

interface PopulatedReportBase extends ReportBase {
  reporterName: string,
  reporteeName: string,
  setTitle: string,
}

interface PopulatedResolvedReport extends ResolvedReport, PopulatedReportBase {
  moderatorName: string,
}

export type Report = ReportBase | ResolvedReport;
export type PopulatedReport = PopulatedReportBase | PopulatedResolvedReport;