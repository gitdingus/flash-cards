interface ReportBase {
  id: string, 
  reporter: string,
  reportee: string,
  setId: string,
  reason: string,
  dateCreated: Date,
} 

interface ResolvedReport extends ReportBase{
  resolved: boolean,
  dateResolved: Date,
  moderatedBy: string,
  actionTaken: string,
}