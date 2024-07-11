export interface ReportBase {
  reportId: string, 
  reporter: string,
  reportee: string,
  setId: string,
  reason: string,
  dateCreated: Date,
  resolved: false,
} 

export interface PopulatedReportBase extends ReportBase{
  reporterName: string,
  reporteeName: string,
  setName: string,
}

export interface ResolvedReport extends ReportBase {
  resolutionId: string,
  resolved: true,
  dateResolved: Date,
  moderatedId: string,
  actionTaken: string,
  explanation: string,
  setLastModified: Date,
}

export interface PopulatedResolvedReport extends ResolvedReport, PopulatedReportBase {
  moderatorName: string,
}

export type Report = ReportBase | ResolvedReport;
export type PopulatedReport = PopulatedReportBase | PopulatedResolvedReport;

export interface ReportSummary {
  setId: string,
  setName: string,
  setOwner: string,
  reportCount: number,
  resolved: boolean,
  earliestReport: Date,
}