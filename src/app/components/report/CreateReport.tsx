'use client';

interface CreateReportProps {
  reporter: string,
  reportee: string,
  setId: string,
}
export default function CreateReport({ reporter, reportee, setId } : CreateReportProps) {
  return (
    <div>
      <button type="button">Report</button>
      <div>
        <form>
          <label>
            Reason:
            <textarea rows={10} cols={75}></textarea>
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  )
}